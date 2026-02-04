import { zodResolver } from "@hookform/resolvers/zod";
import { CloudUpload } from "@mui/icons-material";
import {
	Alert,
	Button,
	Divider,
	Stack,
	styled,
	Typography,
} from "@mui/material";
import { useMutation } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import {
	type FieldPath,
	type FieldValues,
	type UseControllerProps,
	useController,
	useForm,
} from "react-hook-form";
import z from "zod";
import { toaster } from "../components/Toaster";
import { type DBItem, dbItemSchema } from "../lib/interfaces";
import { db } from "../lib/lunr";

export const Route = createFileRoute("/manage")({
	component: RouteComponent,
});

function generateDownload<D>(json: D, filename: string) {
	// Turn the JSON object into a string
	const data = JSON.stringify(json);

	// Pass the string to a Blob and turn it
	// into an ObjectURL
	const blob = new Blob([data], { type: "application/json" });
	const jsonObjectUrl = URL.createObjectURL(blob);

	// Create an anchor element, set it's
	// href to be the Object URL we have created
	// and set the download property to be the file name
	// we want to set
	const anchorEl = document.createElement("a");
	anchorEl.href = jsonObjectUrl;
	anchorEl.download = filename;

	// There is no need to actually attach the DOM
	// element but we do need to click on it
	anchorEl.click();

	// We don't want to keep a reference to the file
	// any longer so we release it manually
	URL.revokeObjectURL(jsonObjectUrl);
	anchorEl.remove();
}

async function exportDB() {
	const transaction = (await db).transaction("components");
	const allData = await transaction.store.getAll();
	await transaction.done;

	return allData;
}

async function importDB(data: DBItem[]) {
	const transaction = (await db).transaction("components", "readwrite");
	await Promise.all(data.map((item) => transaction.store.put(item)));
	await transaction.done;
}

async function resetDB() {
	await (await db).clear("components");
}

async function parseXLSX(file: File) {
	const text = await file?.arrayBuffer();

	const { read, utils } = await import("xlsx");

	const workbook = read(text, { type: "buffer" });
	const sheet = workbook.Sheets[workbook.SheetNames[0]];
	const capitalRows = utils.sheet_to_json(sheet);

	const lowerCaseRows = capitalRows.map((row) =>
		Object.fromEntries(
			// biome-ignore lint/complexity/noBannedTypes: Jank
			Object.entries(row as {}).map(([key, value]) => [
				key.toLowerCase(),
				value,
			]),
		),
	);

	return lowerCaseRows;
}

function useExport() {
	return useMutation({
		mutationFn: exportDB,
		onSuccess: (data) => {
			generateDownload(data, "data.json");
		},
	});
}

function useImportJSON() {
	return useMutation({
		mutationFn: importDB,
		onSuccess: (_data, vars) => {
			toaster.success({
				title: `Successfully imported ${vars.length} items into the database.`,
			});
		},
	});
}

function useResetDB() {
	return useMutation({
		mutationFn: resetDB,
		onSuccess: () => {
			toaster.success({
				title: "Reset DB Successfully",
			});
		},
	});
}

function RouteComponent() {
	const exportMutation = useExport();
	const resetMutation = useResetDB();

	return (
		<Stack className="gap-5">
			<Stack className="flex-row gap-2 justify-center">
				<Button
					variant="contained"
					onClick={() => exportMutation.mutate()}
					loading={exportMutation.isPending}
				>
					Export JSON
				</Button>
				<Button
					variant="contained"
					color="error"
					onClick={() => resetMutation.mutate()}
					loading={resetMutation.isPending}
				>
					Reset Database
				</Button>
			</Stack>
			<Divider />
			<ImportForm />
		</Stack>
	);
}

function ImportForm() {
	const { control, handleSubmit } = useForm({
		resolver: zodResolver(
			z.object({
				files: z.instanceof(FileList),
			}),
		),
	});

	const importJsonMutation = useImportJSON();

	const onSubmit = handleSubmit(async (inputData) => {
		const file = inputData.files.item(0) as File;

		const data =
			file.type ===
			"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
				? await parseXLSX(file)
				: JSON.parse(await file.text());

		const safeArray = await z.array(z.any()).parseAsync(data);

		const finalData: Array<DBItem> = [];

		for (const rawDBItem of safeArray) {
			const { success, data, error } =
				await dbItemSchema.safeParseAsync(rawDBItem);

			if (success) finalData.push(data);

			if (!success) console.log(error, rawDBItem);
		}

		console.log(finalData);

		await importJsonMutation.mutateAsync(finalData);
		console.log("success");
	});

	return (
		<Stack component={"form"} className="gap-2" onSubmit={onSubmit}>
			<Typography variant="h4" component={"h4"} className="pb-2">
				Import
			</Typography>
			<Typography variant="body1" component={"p"}>
				Import a JSON or XLSX file.
			</Typography>
			<ControlledFileUpload
				name="files"
				control={control}
				multiple={false}
				accept=".xlsx, .json"
			/>
			<Button type="submit">Submit</Button>
		</Stack>
	);
}

type ControlledFileUploadProps<
	TFieldValues extends FieldValues = FieldValues,
	TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = UseControllerProps<TFieldValues, TName> &
	React.DetailedHTMLProps<
		React.InputHTMLAttributes<HTMLInputElement>,
		HTMLInputElement
	>;

const VisuallyHiddenInput = styled("input")({
	clip: "rect(0 0 0 0)",
	clipPath: "inset(50%)",
	height: 1,
	overflow: "hidden",
	position: "absolute",
	bottom: 0,
	left: 0,
	whiteSpace: "nowrap",
	width: 1,
});

function ControlledFileUpload<
	TFieldValues extends FieldValues = FieldValues,
	TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(props: ControlledFileUploadProps<TFieldValues, TName>) {
	const {
		name,
		rules,
		shouldUnregister,
		defaultValue,
		control,
		disabled,
		exact,
		...inputProps
	} = props;

	const { fieldState, field } = useController({
		name,
		rules,
		shouldUnregister,
		defaultValue,
		control,
		disabled,
		exact,
	});

	const files = useMemo(() => {
		const value = field.value as FileList | undefined | File;

		if (!value) return;

		if (!(value instanceof FileList)) {
			return [value];
		}

		const filesarr: File[] = [];

		for (let index = 0; index < value.length; index++) {
			const element = value.item(index);

			if (!element) return;

			filesarr.push(element);
		}

		return filesarr;
	}, [field.value]);

	return (
		<>
			<Typography variant="body1">
				{files?.map((f) => f.name)?.join()}
			</Typography>
			<Button
				component="label"
				variant="contained"
				tabIndex={-1}
				startIcon={<CloudUpload />}
			>
				Upload files ({files?.length ?? 0})
				<VisuallyHiddenInput
					{...inputProps}
					onChange={(e) => field.onChange(e.target.files)}
					type="file"
				/>
			</Button>
			{fieldState.error ? (
				<Alert severity="error" color="error">
					{fieldState.error.message}
				</Alert>
			) : null}
		</>
	);
}

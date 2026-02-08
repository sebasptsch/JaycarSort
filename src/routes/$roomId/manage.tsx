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
import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useMemo } from "react";
import {
	type FieldPath,
	type FieldValues,
	type UseControllerProps,
	useController,
	useForm,
} from "react-hook-form";
import type { Row } from "tinybase/with-schemas";
import z from "zod";
import { LinkButton } from "../../components/LinkButton";
import { type DBItem, dbItemSchema } from "../../lib/interfaces";
import { type Schemas, STORE_ID, useStore } from "../../lib/tinybase-typed";

export const Route = createFileRoute("/$roomId/manage")({
	component: RouteComponent,
});

function generateDownload(blob: Blob, filename: string) {
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

async function exportXLSX(data: Row<Schemas[0], "components">[]) {
	const { write, utils } = await import("xlsx");

	const workBook = utils.book_new();

	const sheet = utils.json_to_sheet(data);

	utils.book_append_sheet(workBook, sheet);

	const res = write(workBook, {
		type: "array",
	});

	return res;
}

function useImportDB() {
	const store = useStore(STORE_ID);

	return useCallback(
		(data: Row<Schemas[0], "components">[]) => {
			store?.setTable(
				"components",
				Object.fromEntries(data.map((row) => [row.item, row])),
			);
		},
		[store],
	);
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
	const store = useStore(STORE_ID);

	const storeToObject = useCallback(
		async (type: "json" | "xlsx" = "json") => {
			const storeContents = store
				? Object.values(store.getTable("components"))
				: undefined;

			if (!storeContents) return undefined;

			if (type === "json") {
				console.log(storeContents);
				generateDownload(
					new Blob([JSON.stringify(storeContents)], {
						type: "application/json",
					}),
					"data.json",
				);
			} else {
				const xlsxString = await exportXLSX(storeContents);
				generateDownload(
					new Blob([xlsxString], {
						type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
					}),
					"data.xlsx",
				);
			}
		},
		[store],
	);

	return storeToObject;
}
function RouteComponent() {
	const exportCallback = useExport();

	return (
		<Stack className="gap-5">
			<Stack className="flex-row gap-2 justify-center">
				<LinkButton
					variant="contained"
					to="/$roomId/add"
					from="/$roomId/manage"
					params={(curr) => ({ roomId: curr.roomId })}
				>
					Add
				</LinkButton>
				<Button variant="contained" onClick={() => exportCallback("json")}>
					Export JSON
				</Button>
				<Button variant="contained" onClick={() => exportCallback("xlsx")}>
					Export XLSX
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

	const importJsonMutation = useImportDB();

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

		importJsonMutation(finalData);
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

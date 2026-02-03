import { zodResolver } from "@hookform/resolvers/zod";
import { CloudUpload } from "@mui/icons-material";
import { Button, Stack, styled } from "@mui/material";
import { createFileRoute } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { z } from "zod";
import useClearIndex from "../hooks/useClearIndex";
import useCreateIndex from "../hooks/useCreateIndex";
import type { Columns, DBItem } from "../lib/interfaces";

export const Route = createFileRoute("/load")({
	component: RouteComponent,
});

const uploadSchema = z.object({
	filelist: z
		.instanceof(FileList)
		.refine((v) => v.length > 0, { error: "Must select a file" }),
});

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

function RouteComponent() {
	const {
		handleSubmit,
		register,
		formState: { isLoading, isDirty },
	} = useForm({
		resolver: zodResolver(uploadSchema),
	});

	const navigate = Route.useNavigate();

	const clearIndex = useClearIndex();
	const createIndex = useCreateIndex();

	/**
	 * Handles the user submitting the form and moves data from react's state variables to the database.
	 * @param e Submit Event (not used except to prevent page reload on submit).
	 * @returns a promise that is resolved once all excel document data has been moved from state to the database.
	 */
	const onSubmit = handleSubmit(
		async ({ filelist }) => {
			const { read, utils } = await import("xlsx");
			const file = filelist.item(0);

			if (!file) throw new Error("Not enough files");

			const text = await file?.arrayBuffer();

			var workbook = read(text, { type: "buffer" });
			var sheet = workbook.Sheets[workbook.SheetNames[0]];
			var jsonsheet = utils.sheet_to_json(sheet);

			const data = jsonsheet
				.map((component): DBItem => {
					const row = component as Columns;
					return {
						location: row.Location,
						barcode: row.Barcode,
						description: row.Description ?? "",
						unit: row.Unit,
						shelf: row.Shelf,
						tray: row.Tray,
						item: row.Item,
					};
				})
				.filter((c) => !!c.item && !!c.barcode);

			await clearIndex.mutateAsync();
			console.log("Cleared Index");
			await createIndex.mutateAsync(data);
			console.log("Created new index");
			navigate({
				to: "/",
			});
		},
		(errors) => {
			alert(errors.filelist?.message);
		},
	);

	return (
		<Stack component={"form"} onSubmit={onSubmit}>
			<Button
				component="label"
				variant="contained"
				tabIndex={-1}
				startIcon={<CloudUpload />}
			>
				Upload files
				<VisuallyHiddenInput
					type="file"
					multiple={false}
					accept=".xlsx"
					{...register("filelist")}
				/>
			</Button>
			<Button type="submit" loading={isLoading} disabled={!isDirty}>
				Submit
			</Button>
		</Stack>
	);
}

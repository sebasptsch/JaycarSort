import { zodResolver } from "@hookform/resolvers/zod";
import {
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
	Stack,
	TextField,
	useMediaQuery,
	useTheme,
} from "@mui/material";
import { createFileRoute } from "@tanstack/react-router";
import { DateTime } from "luxon";
import { useCallback, useEffect } from "react";
import { useForm } from "react-hook-form";
import z from "zod";
import ControlledTextField from "../../components/ControlledTextField";
import { toaster } from "../../components/Toaster";
import { SYNCED_STORE_ID, useRowStateSynced } from "../../lib/tinybase-typed";

export const Route = createFileRoute("/$roomId/notes/$noteId")({
	component: RouteComponent,
});

const noteSchema = z.object({
	title: z.string(),
	content: z.string(),
	archived: z.boolean(),
	createdAt: z.string(),
	updatedAt: z.string(),
});

function RouteComponent() {
	const noteId = Route.useParams({ select: (params) => params.noteId });

	const navigate = Route.useNavigate();

	const handleClose = useCallback(() => {
		navigate({
			to: "..",
		});
	}, [navigate]);

	const [row, setRow] = useRowStateSynced("notes", noteId, SYNCED_STORE_ID);

	const {
		control,
		handleSubmit,
		reset,
		formState: { isDirty, isSubmitting },
	} = useForm({
		resolver: zodResolver(noteSchema),
		defaultValues: {
			archived: row.archived ?? false,
			title: row.title ?? "",
			content: row.content ?? "",
			createdAt: row.createdAt ?? new Date().toISOString(),
			updatedAt: row.updatedAt ?? new Date().toISOString(),
		},
	});

	useEffect(() => {
		reset(row, {
			keepDirty: true,
		});
	}, [row, reset]);

	const onSubmit = handleSubmit((data) => {
		console.log("form submitted", data);
		const newRowData = {
			...data,
			updatedAt: new Date().toISOString(),
		};
		setRow(newRowData);
		toaster.success({
			title: "Saved Note",
		});
		reset(newRowData);
	});

	const theme = useTheme();

	const fullScreen = useMediaQuery(theme.breakpoints.down("md"));

	return (
		<Dialog
			open
			onClose={handleClose}
			fullScreen={fullScreen}
			fullWidth
			maxWidth="md"
			component="form"
			onSubmit={onSubmit}
		>
			<DialogTitle>Edit Note</DialogTitle>
			<DialogContent>
				<DialogContentText>Write a new note</DialogContentText>

				<Stack gap={2} pt={2}>
					<Stack direction={"row"} gap={1}>
						<TextField
							disabled
							value={DateTime.fromISO(row.createdAt).toLocaleString(
								DateTime.DATETIME_MED_WITH_WEEKDAY,
							)}
							label="Created At"
							fullWidth
						/>
						<TextField
							disabled
							value={DateTime.fromISO(row.updatedAt).toLocaleString(
								DateTime.DATETIME_MED_WITH_WEEKDAY,
							)}
							label="Updated At"
							fullWidth
						/>
					</Stack>

					<ControlledTextField control={control} name="title" label="Title" />
					<ControlledTextField
						control={control}
						name="content"
						label="Content"
						multiline
						rows={5}
					/>
				</Stack>
			</DialogContent>
			<DialogActions>
				<Button type="button" onClick={handleClose}>
					Close
				</Button>
				<Button type="submit" disabled={!isDirty} loading={isSubmitting}>
					Save
				</Button>
			</DialogActions>
		</Dialog>
	);
}

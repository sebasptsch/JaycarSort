import { Add } from "@mui/icons-material";
import {
	Fab,
	List,
	ListItem,
	ListItemButton,
	ListItemText,
} from "@mui/material";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { useCallback, useMemo } from "react";
import { ulid } from "ulid";
import { LinkListItemButton } from "../../components/LinkItemButton";
import { toaster } from "../../components/Toaster";
import {
	STORE_ID,
	useStore,
	useTable,
	useTableState,
} from "../../lib/tinybase-typed";

export const Route = createFileRoute("/$roomId/notes")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div
			style={{
				position: "relative",
			}}
		>
			<NotesTable />
			<Outlet />
			<AddNoteFab />
		</div>
	);
}

function AddNoteFab() {
	const navigate = Route.useNavigate();

	const store = useStore(STORE_ID);

	const handleClick = useCallback(() => {
		// const newUlid = ulid();

		const rowId = store?.addRow(
			"notes",
			{
				archived: false,
				content: "",
				title: "",
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			},
			false,
		);

		if (!rowId) {
			toaster.error({
				title: "Failed to create new empty note.",
			});
			return;
		}

		navigate({
			to: "./$noteId",
			params: {
				noteId: rowId,
			},
		});
	}, [navigate, store]);

	return (
		<Fab
			color="primary"
			aria-label="add"
			className="absolute bottom-3 right-3"
			onClick={handleClick}
		>
			<Add />
		</Fab>
	);
}

function NotesTable() {
	const [table] = useTableState("notes", STORE_ID);

	const rows = useMemo(
		() =>
			Object.entries(table).map(([key, value]) => ({
				key,
				...value,
			})),
		[table],
	);

	console.log({ rows });

	return (
		<List>
			{rows.map((row) => (
				<LinkListItemButton
					key={row.key}
					from="/$roomId/notes"
					to="/$roomId/notes/$noteId"
					params={{
						noteId: row.key,
					}}
				>
					<ListItemText>
						{row.title ?? `${row.content.slice(0, 16)}...`}
					</ListItemText>
				</LinkListItemButton>
			))}
		</List>
	);
}

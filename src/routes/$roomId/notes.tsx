import { Add } from "@mui/icons-material";
import { Fab, List, ListItem, ListItemText } from "@mui/material";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { useMemo } from "react";
import { LinkFab } from "../../components/LinkFab";
import { STORE_ID, useTable } from "../../lib/tinybase-typed";

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

	return (
		<Fab color="primary" aria-label="add" className="absolute bottom-3 right-3">
			<Add />
		</Fab>
	);
}

function NotesTable() {
	const table = useTable("notes", STORE_ID);

	const rows = useMemo(
		() =>
			Object.entries(table).map(([key, value]) => ({
				key,
				...value,
			})),
		[table],
	);

	return (
		<List>
			{rows.map((row) => (
				<ListItem key={row.key}>
					<ListItemText>
						{row.title ?? `${row.content.slice(0, 16)}...`}
					</ListItemText>
				</ListItem>
			))}
		</List>
	);
}

import { Add, Delete, Search } from "@mui/icons-material";
import { IconButton, InputAdornment, TextField } from "@mui/material";
import { createFileRoute } from "@tanstack/react-router";
import { createColumnHelper } from "@tanstack/react-table";
import { zodValidator } from "@tanstack/zod-adapter";
import Fuse from "fuse.js";
import { useCallback, useMemo } from "react";
import type { Row } from "tinybase/with-schemas";
import { useDebounceValue } from "usehooks-ts";
import z from "zod";
import Datatable from "../../components/Datatable";
import { LinkButton } from "../../components/LinkButton";
import { LinkFab } from "../../components/LinkFab";
import ScanAdornment from "../../components/ScanAdornment";
import { toaster } from "../../components/Toaster";
import {
	type Schemas,
	STORE_ID,
	useDelRowCallback,
	useTableState,
} from "../../lib/tinybase-typed";

const columnHelper = createColumnHelper<Row<Schemas[0], "components">>();

function DeleteButton({ item }: { item: string }) {
	const handleDelete = useDelRowCallback("components", item, STORE_ID, () => {
		toaster.success({
			title: "Deleted item successfully",
		});
	});

	return (
		<IconButton onClick={handleDelete}>
			<Delete />
		</IconButton>
	);
}

const columns = [
	columnHelper.accessor("item", { header: "Cat No.", size: 100 }),
	columnHelper.display({
		header: "Location",
		id: "location",
		cell: (props) =>
			`${props.row.original.location} ${props.row.original.unit}`,
	}),
	columnHelper.display({
		header: "Shelf",
		cell: (props) =>
			`${props.row.original.location === "Capstan" ? "Column" : "Shelf"} ${props.row.original.shelf}`,
	}),
	columnHelper.display({
		header: "Tray",
		cell: (ce) =>
			` ${
				ce.row.original.location === "Capstan"
					? "Row"
					: ce.row.original.location === "Zone"
						? "Position "
						: "Tray "
			} ${ce.row.original.tray}`,
		id: "tray",
	}),
	columnHelper.accessor("description", {
		header: "Description",
	}),
	columnHelper.accessor("barcode", {
		header: "Barcode",
	}),
	columnHelper.display({
		id: "delete",
		header: "Delete",
		cell: (props) => <DeleteButton item={props.row.original.item} />,
	}),
];

// const fuseQueryOptions = (q = "") =>
// 	queryOptions({
// 		queryKey: ["components", "fuse", q],
// 		queryFn: () => fuseSearch(q),
// 		placeholderData: keepPreviousData,
// 	});

export const Route = createFileRoute("/$roomId/")({
	component: RouteComponent,
	validateSearch: zodValidator(
		z.object({
			q: z.string().default(""),
		}),
	),
});

function RouteComponent() {
	const navigate = Route.useNavigate();

	const query = Route.useSearch({
		select: (s) => s.q,
	});

	const [debounced] = useDebounceValue(query, 500);

	const [table] = useTableState("components", STORE_ID);

	const handleSearch = useCallback(
		(v: string) =>
			navigate({
				to: ".",
				search: { q: v === "" ? undefined : v },
				replace: true,
			}),
		[navigate],
	);

	const fuseInstance = useMemo(() => {
		console.log("re-searched");
		return new Fuse(Object.values(table), {
			keys: ["barcode", "item", "description"],
			includeScore: true,
			useExtendedSearch: true,
			threshold: 0.3,
		});
	}, [table]);

	const results = useMemo(
		() =>
			!debounced?.length
				? Object.values(table)
				: fuseInstance.search(debounced).map((res) => res.item),
		[table, debounced, fuseInstance],
	);

	return (
		<>
			<LinkButton
				variant="text"
				to="/$roomId/manage"
				params={({ roomId }) => ({
					roomId,
				})}
				color="inherit"
				from="/$roomId/"
			>
				Manage
			</LinkButton>
			<TextField
				helperText="Enter Barcode, Catalog Number or Description Keywords"
				onChange={(e) => handleSearch(e.target.value)}
				value={query}
				label="Search"
				slotProps={{
					input: {
						startAdornment: (
							<InputAdornment position="start">
								<Search />
							</InputAdornment>
						),
						endAdornment: (
							<ScanAdornment setSearch={(v) => handleSearch(`'${v}`)} />
						),
					},
				}}
				autoFocus
			/>

			<Datatable
				columns={columns}
				data={results ?? []}
				style={{ height: 60 }}
			/>
			<LinkFab
				to="/$roomId/add"
				from="/$roomId/"
				params={({ roomId }) => ({
					roomId,
				})}
				color="primary"
				aria-label="add"
				className="absolute bottom-3 right-3"
			>
				<Add />
			</LinkFab>
		</>
	);
}

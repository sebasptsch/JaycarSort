import { Delete, Search } from "@mui/icons-material";
import { IconButton, InputAdornment, TextField } from "@mui/material";
import { createFileRoute } from "@tanstack/react-router";
import { createColumnHelper } from "@tanstack/react-table";
import { debounce } from "lodash-es";
import lunr from "lunr";
import { useCallback, useMemo } from "react";
import type { Row } from "tinybase/with-schemas";
import z from "zod";
import Datatable from "../../components/Datatable";
import { LinkButton } from "../../components/LinkButton";
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
	validateSearch: z.object({
		q: z.string().optional(),
	}),
});

function RouteComponent() {
	const navigate = Route.useNavigate();

	const query = Route.useSearch({
		select: (s) => s.q,
	});

	const [table] = useTableState("components", STORE_ID);

	const debouncedSearch = useCallback(
		debounce((v: string) => {
			navigate({
				to: ".",
				search: { q: v === "" ? undefined : v },
				replace: true,
			});
		}, 500),
		[],
	);

	const lunrInstance = useMemo(() => {
		console.log("re-searched");
		return lunr(function () {
			this.ref("item");
			this.field("item");
			this.field("barcode");
			this.field("description");

			Object.values(table).forEach((element) => {
				this.add(element);
			});
		});
	}, [table]);

	const resultIds = useMemo(
		() => lunrInstance.search(query ?? "").map((res) => res.ref),
		[query, lunrInstance],
	);

	const results = useMemo(() => {
		return resultIds.map((id) => table[id]).filter(Boolean);
	}, [resultIds, table]);

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
				onChange={(e) => debouncedSearch(e.target.value)}
				label="Search"
				slotProps={{
					input: {
						startAdornment: (
							<InputAdornment position="start">
								<Search />
							</InputAdornment>
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
		</>
	);
}

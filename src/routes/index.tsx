import { Delete, Search } from "@mui/icons-material";
import { IconButton, InputAdornment, TextField } from "@mui/material";
import {
	keepPreviousData,
	queryOptions,
	useMutation,
	useQuery,
} from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { createColumnHelper } from "@tanstack/react-table";
import { debounce } from "lodash-es";
import { useCallback } from "react";
import z from "zod";
import Datatable from "../components/Datatable";
import { toaster } from "../components/Toaster";
import type { DBItem } from "../lib/interfaces";
import { db, lunrSearch, regenerateIndex } from "../lib/lunr";

const columnHelper = createColumnHelper<DBItem>();

function DeleteButton({ item }: { item: string }) {
	const deleteMutation = useMutation({
		mutationFn: async (itemId: string) =>
			(await db).delete("components", itemId),
		onSuccess: () => {
			toaster.success({
				title: "Deleted item successfully",
			});
			regenerateIndex();
		},
	});

	const handleDelete = () => {
		deleteMutation.mutate(item);
	};

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

const lunrQueryOptions = (q = "") =>
	queryOptions({
		queryKey: ["components", "lunr", q],
		queryFn: () => lunrSearch(q),
		placeholderData: keepPreviousData,
	});

// const fuseQueryOptions = (q = "") =>
// 	queryOptions({
// 		queryKey: ["components", "fuse", q],
// 		queryFn: () => fuseSearch(q),
// 		placeholderData: keepPreviousData,
// 	});

export const Route = createFileRoute("/")({
	component: RouteComponent,
	validateSearch: z.object({
		q: z.string().optional(),
	}),
	loaderDeps: ({ search: { q } }) => ({ q }),
	loader: ({ deps: { q }, context: { queryClient } }) => {
		queryClient.prefetchQuery(lunrQueryOptions(q));
	},
});

function RouteComponent() {
	const navigate = Route.useNavigate();

	const query = Route.useSearch({
		select: (s) => s.q,
	});

	const results = useQuery(lunrQueryOptions(query));

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

	return (
		<>
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
				data={results.data ?? []}
				style={{ height: 60 }}
			/>
		</>
	);
}

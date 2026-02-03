import { ArrowDownward, ArrowUpward } from "@mui/icons-material";
import {
	Paper,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	type TableContainerProps,
	TableHead,
	TableRow,
} from "@mui/material";
import {
	type ColumnDef,
	flexRender,
	getCoreRowModel,
	getFilteredRowModel,
	getSortedRowModel,
	type Row,
	type SortingState,
	type Table as TanstackTable,
	useReactTable,
	type VisibilityState,
} from "@tanstack/react-table";
import {
	useVirtualizer,
	type VirtualItem,
	type Virtualizer,
} from "@tanstack/react-virtual";
import { useRef, useState } from "react";

export interface DatatableProps<Data> extends TableContainerProps {
	data: Data[];
	// biome-ignore lint/suspicious/noExplicitAny: Must be any
	columns: ColumnDef<Data, any>[];
}

export default function Datatable<Data>({
	data,
	columns,
	...tableContainerProps
}: DatatableProps<Data>) {
	const [sorting, setSorting] = useState<SortingState>([]);
	const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
	const tableContainerRef = useRef<HTMLDivElement>(null);

	const table = useReactTable<Data>({
		columns,
		data,
		getCoreRowModel: getCoreRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		onSortingChange: setSorting,
		onColumnVisibilityChange: setColumnVisibility,
		getSortedRowModel: getSortedRowModel(),
		state: {
			sorting,
			columnVisibility,
		},
	});

	return (
		<TableContainer
			component={Paper}
			ref={tableContainerRef}
			className="grow overflow-auto relative"
			{...tableContainerProps}
		>
			<Table className="grid">
				<TableHead component={Paper} className="grid sticky top-0 z-10">
					{table.getHeaderGroups().map((headerGroup) => (
						<TableRow key={headerGroup.id} className="flex w-full">
							{headerGroup.headers.map((header) => (
								<TableCell
									component={"th"}
									key={header.id}
									colSpan={header.colSpan}
									style={{ width: header.getSize() }}
									className="flex"
									onClick={header.column.getToggleSortingHandler()}
								>
									{header.isPlaceholder ? null : (
										<b>
											{flexRender(
												header.column.columnDef.header,
												header.getContext(),
											)}
											{{
												asc: <ArrowUpward fontSize={"small"} />,
												desc: <ArrowDownward fontSize={"small"} />,
											}[header.column.getIsSorted() as string] ?? null}
										</b>
									)}
								</TableCell>
							))}
						</TableRow>
					))}
				</TableHead>
				<VirtualTableBody table={table} tableContainerRef={tableContainerRef} />
			</Table>
		</TableContainer>
	);
}

interface VirtualTableBodyProps<Data> {
	table: TanstackTable<Data>;
	tableContainerRef: React.RefObject<HTMLDivElement | null>;
}

function VirtualTableBody<Data>({
	table,
	tableContainerRef,
}: VirtualTableBodyProps<Data>) {
	const { rows } = table.getRowModel();

	// Important: Keep the row virtualizer in the lowest component possible to avoid unnecessary re-renders.
	const rowVirtualizer = useVirtualizer<HTMLDivElement, HTMLTableRowElement>({
		count: rows.length,
		estimateSize: () => 53, //estimate row height for accurate scrollbar dragging
		getScrollElement: () => tableContainerRef.current,
		//measure dynamic row height, except in firefox because it measures table border height incorrectly
		measureElement:
			typeof window !== "undefined" &&
			navigator.userAgent.indexOf("Firefox") === -1
				? (element) => element?.getBoundingClientRect().height
				: undefined,
		overscan: 5,
	});

	return (
		<TableBody
			className="relative grid grow"
			style={{
				height: `${rowVirtualizer.getTotalSize()}px`,
			}}
		>
			{rowVirtualizer.getVirtualItems().map((virtualRow) => {
				const row = rows[virtualRow.index] as Row<Data>;
				return (
					<VirtualTableRow
						row={row}
						key={row.id}
						virtualRow={virtualRow}
						rowVirtualizer={rowVirtualizer}
					/>
				);
			})}
		</TableBody>
	);
}

interface VirtualTableRowProps<Data> {
	row: Row<Data>;
	virtualRow: VirtualItem;
	rowVirtualizer: Virtualizer<HTMLDivElement, HTMLTableRowElement>;
}

function VirtualTableRow<Data>({
	row,
	virtualRow,
	rowVirtualizer,
}: VirtualTableRowProps<Data>) {
	return (
		<TableRow
			key={row.id}
			component="tr"
			data-index={virtualRow.index} //needed for dynamic row height measurement
			ref={(node) => rowVirtualizer.measureElement(node)} //measure dynamic row height
			className="absolute flex w-full"
			style={{
				transform: `translateY(${virtualRow.start}px)`, //this should always be a `style` as it changes on scroll
			}}
		>
			{row.getVisibleCells().map((cell) => {
				//   const meta: any = cell.column.columnDef.meta;
				return (
					<TableCell
						key={cell.id}
						component="td"
						className="flex"
						style={{
							width: cell.column.getSize(),
						}}
					>
						{flexRender(cell.column.columnDef.cell, cell.getContext())}
					</TableCell>
				);
			})}
		</TableRow>
	);
}

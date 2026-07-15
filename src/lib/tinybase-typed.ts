// types
import * as UiReact from "tinybase/ui-react/with-schemas";
import type { NoValuesSchema } from "tinybase/with-schemas";

export const STORE_ID = "componentsStore";
export const QUERIES_ID = "componentsQueries";

export const TABLES_SCHEMA = {
	components: {
		barcode: { type: "string", default: "" },
		description: { type: "string", default: "" },
		item: { type: "string", default: "" },
		location: { type: "string", default: "" as "Turbine" | "Capstan" | "Zone" },
		shelf: { type: "number", default: 1 },
		tray: { type: "number", default: 1 },
		unit: { type: "string", default: "" },
	},
	notes: {
		archived: { type: "boolean", default: false },
		content: { type: "string", default: "" },
		title: { type: "string", default: "" },
		createdAt: { type: "string", default: new Date().toISOString() },
		updatedAt: { type: "string", default: new Date().toISOString() },
	},
} as const;

export type Schemas = [typeof TABLES_SCHEMA, NoValuesSchema];

// Destructure the ui-react module with the schema applied.
export const {
	useProvideStore,
	useCreatePersister,
	useCreateMergeableStore,
	useSetRowCallback,
	useCreateSynchronizer,
	useAddRowCallback,
	useDelRowCallback,
	useTableState,
	useTable,
	useResultTable,
	useCreateQueries,
	useProvideQueries,
	useStore,
	useRow,
	useRowState,
} = UiReact as UiReact.WithSchemas<Schemas>;

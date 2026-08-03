// types
import { DateTime } from "luxon";
import * as UiReact from "tinybase/ui-react/with-schemas";
import type { NoValuesSchema, TablesSchema } from "tinybase/with-schemas";

export const SYNCED_STORE_ID = "componentsStore";

export const LOCAL_STORE_ID = "localStore"

export const SYNCED_TABLES_SCHEMA = {
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
} satisfies TablesSchema

export const LOCAL_TABLES_SCHEMA = {
	recentRooms: {
		roomId: {
			type: "string",
			default: "",
		},
		lastUsed: {
			type: "string",
			default: DateTime.now().toISO()
		}
	}
} satisfies TablesSchema

export type SyncedSchemas = [typeof SYNCED_TABLES_SCHEMA, NoValuesSchema]

export type LocalSchemas = [typeof LOCAL_TABLES_SCHEMA, NoValuesSchema]

// Destructure the ui-react module with the schema applied.
export const {
	useProvideStore: useProvideStoreSynced,
	useCreatePersister: useCreatePersisterSynced,
	useCreateMergeableStore: useCreateMergeableStoreSynced,
	useSetRowCallback: useSetRowCallbackSynced,
	useCreateSynchronizer: useCreateSynchronizerSynced,
	useAddRowCallback: useAddRowCallbackSynced,
	useDelRowCallback: useDelRowCallbackSynced,
	useTableState: useTableStateSynced,
	useTable: useTableSynced,
	useResultTable: useResultTableSynced,
	useCreateQueries: useCreateQueriesSynced,
	useProvideQueries: useProvideQueriesSynced,
	useStore: useStoreSynced,
	useRow: useRowSynced,
	useRowState: useRowStateSynced,
} = UiReact as UiReact.WithSchemas<SyncedSchemas>;

export const {
	useProvideStore: useProvideStoreLocal,
	useCreatePersister: useCreatePersisterLocal,
	useCreateStore: useCreateStoreLocal,
	useSetRowCallback: useSetRowCallbackLocal,
	useCreateSynchronizer: useCreateSynchronizerLocal,
	useAddRowCallback: useAddRowCallbackLocal,
	useDelRowCallback: useDelRowCallbackLocal,
	useTableState: useTableStateLocal,
	useTable: useTableLocal,
	useResultTable: useResultTableLocal,
	useCreateQueries: useCreateQueriesLocal,
	useProvideQueries: useProvideQueriesLocal,
	useStore: useStoreLocal,
	useRow: useRowLocal,
	useRowState: useRowStateLocal,
} = UiReact as UiReact.WithSchemas<LocalSchemas>;

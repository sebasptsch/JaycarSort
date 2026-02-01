import type { IndexedDBProps } from "@slnsw/react-indexed-db";

/**
 * DB Configuration for the browser's IndexedDB.
 */
export const DBConfig: IndexedDBProps = {
	name: "JaycarDB",
	version: 1,
	objectStoresMeta: [
		{
			store: "components",
			storeConfig: { keyPath: "id", autoIncrement: true },
			storeSchema: [
				{ name: "location", keypath: "location", options: { unique: false } },
				{ name: "unit", keypath: "unit", options: { unique: false } },
				{ name: "shelf", keypath: "shelf", options: { unique: false } },
				{ name: "tray", keypath: "tray", options: { unique: false } },
				{ name: "barcode", keypath: "barcode", options: { unique: false } },
				{ name: "item", keypath: "item", options: { unique: false } },
				{
					name: "description",
					keypath: "description",
					options: { unique: false },
				},
				{ name: "notes", keypath: "notes", options: { unique: false } },
			],
		},
	],
};

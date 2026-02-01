import { openDB } from "idb";
import type { DBItem } from "./interfaces";

export const storeName = "components" as const

interface DBSchema {
	components: {key: string, value: DBItem}
}

export const db = await openDB<DBSchema>(storeName, 1, {
	upgrade(db) {
		// Create a store of objects
		db.createObjectStore(storeName, {
			// The 'id' property of the object will be the key.
			keyPath: "item",
			// If it isn't explicitly set, create a value by auto incrementing.
			autoIncrement: true,
		});
	},
});

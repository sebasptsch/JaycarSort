import lunr from "lunr";
import { Packr, pack, unpack } from "msgpackr";
import type { DBItem } from "./interfaces";
import { openDB, type DBSchema } from "idb";

const idxStorageKey = "search-idx" as const;
const sharedStructuresKey = "shared-structures.mp" as const;

const storeName = "components" as const

interface MySchema extends DBSchema {
	components: {key: string, value: DBItem}
}

const db = await openDB<MySchema>(storeName, 1, {
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


const packr = new Packr({
	getStructures: () => {
		const sharedStructuresLS = localStorage.getItem(sharedStructuresKey);
		return sharedStructuresLS ? unpack(sharedStructuresLS) : [];
	},
	saveStructures: (structures) => {
		localStorage.setItem(sharedStructuresKey, pack(structures));
	},
	structuredClone: true
});

const createBlankIndex = () =>
	lunr(function () {
		this.ref("item");
		this.field("item");
		this.field("barcode");
		this.field("description");
	});

export const createIndex = async (data: DBItem[]) => {
	const tx = db.transaction(storeName, "readwrite")

	await Promise.all([...data.map((i) => tx.store.add(i)), tx.done])

	const idx = 
		lunr(function () {
			this.ref("item");
			this.field("item");
			this.field("barcode");
			this.field("description");

			data.forEach((doc) => {
				this.add(doc);
			});
		})


	localStorage.setItem(idxStorageKey, JSON.stringify(idx));

	return idx;
};

export const restoreIndex = () => {
	const lsIdx = localStorage.getItem(idxStorageKey);

	if (!lsIdx) return createBlankIndex()

	const idx = lunr.Index.load(JSON.parse(lsIdx));

	return idx;
};

export const clearIndex = async () => {
	localStorage.removeItem(idxStorageKey);
	await db.clear(storeName)

	return createBlankIndex()
};

const getComponents = async (ids: string[]) => {
	const transaction = db.transaction("components", "readonly");

	const items = await Promise.all(ids.map((id) => transaction.store.get(id)));

	await transaction.done;

	return items;
}

export const search = async (idx: lunr.Index, searchText: string) => {
	const searchResults = idx.search(searchText)

	const references = await getComponents(searchResults.map((v) => v.ref))

	return references.map((res, index) => ({...res, ...searchResults[index]}))
}
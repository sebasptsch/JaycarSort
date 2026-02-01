import lunr from "lunr";
import type { DBItem } from "./interfaces";
import { openDB, type DBSchema } from "idb";
import { trytm } from "./trytm";
import Fuse from "fuse.js";

const lunrIndexKey = "search-idx" as const;
const fuseIndexKey = "search-lunr" as const;

const storeName = "components" as const;

const lunrls = localStorage.getItem(lunrIndexKey)
const fusels = localStorage.getItem(fuseIndexKey)

let lunrIndex = lunrls ? lunr.Index.load(JSON.parse(lunrls)) : undefined;
let fuseIndex = fusels ? Fuse.parseIndex(JSON.parse(fusels)) : undefined;

interface MySchema extends DBSchema {
	components: {key: string, value: DBItem}
}

const db = openDB<MySchema>(storeName, 1, {
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

export const createIndex = async (data: DBItem[]) => {
	const tx = (await db).transaction(storeName, "readwrite")

	const res = await Promise.all(data.map((i) => trytm(tx.store.put(i))))

	res.forEach(([_res, err] )=> {
		if (err) {
			console.log(err)
		}
	});

	await tx.done;

	lunrIndex = 
		lunr(function () {
			this.ref("item");
			this.field("item");
			this.field("barcode");
			this.field("description");

			data.forEach((doc) => {
				this.add(doc);
			});
		})

		fuseIndex = Fuse.createIndex(["item", "barcode", "description"], data)

	localStorage.setItem(fuseIndexKey, JSON.stringify(fuseIndex))
	localStorage.setItem(lunrIndexKey, JSON.stringify(lunrIndex));
};

export const clearIndex = async () => {
	localStorage.removeItem(lunrIndexKey);
	await (await db).clear(storeName)

	lunrIndex = undefined;
	fuseIndex = undefined;
};

const getComponents = async (ids: string[]) => {
	const start = performance.now()
	const tx = (await db).transaction("components", "readonly");

	const items = await Promise.all(ids.map((id) => tx.store.get(id)));

	await tx.done;

	const end = performance.now()

	console.log(`Got components, took: ${Math.round(end - start)}ms`)

	return items;
}

export const lunrSearch = async (searchText: string, limit = 5) => {
	if (!lunrIndex) return []

	const searchResults = lunrIndex.search(searchText).slice(undefined, limit -1)

	const references = await getComponents(searchResults.map((v) => v.ref))

	return references
}

export const fuseSearch = async (searchText: string, limit = 5) => {
	if (!fuseIndex) return []

	const all = await (await db).getAll("components")

	const fuse = new Fuse<DBItem>(all, {
		keys: ['barcode', 'item', 'description'],
        includeScore: true,
        useExtendedSearch: true,
        threshold: 0.3,
	}, fuseIndex)

	const searchResults = fuse.search(searchText).slice(0, limit - 1)

	return searchResults.map(fr => fr.item)
}
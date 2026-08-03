// code

import { createIndexedDbPersister } from "tinybase/persisters/persister-indexed-db/with-schemas";
import { createStore } from "tinybase/with-schemas";
import { isTauri } from "../lib/isTauri";
import { createTauriPersister } from "../lib/tauriPersister";
import {
	LOCAL_STORE_ID,
	LOCAL_TABLES_SCHEMA,
	useCreatePersisterLocal,
	useCreateStoreLocal,
	useProvideStoreLocal,
} from "../lib/tinybase-typed";

export function LocalStoreInitialiser() {
	// Create the Store and set its schema
	const localStore = useCreateStoreLocal(() =>
		createStore().setTablesSchema(LOCAL_TABLES_SCHEMA),
	);

	// Create a local storage persister for the Store and start it
	useCreatePersisterLocal(
		localStore,
		(store) => {
			if (isTauri) {
				return createTauriPersister(store, LOCAL_STORE_ID);
			}

			return createIndexedDbPersister(store, LOCAL_STORE_ID);
		},
		[],
		(persister) => persister.startAutoPersisting(),
	);

	// Provide the Store for the rest of the app.
	useProvideStoreLocal(LOCAL_STORE_ID, localStore);

	// Don't render anything.
	return null;
}

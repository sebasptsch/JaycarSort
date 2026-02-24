// code

import { WebSocket as ReconnectingWebSocket } from "partysocket";
import { createIndexedDbPersister } from "tinybase/persisters/persister-indexed-db/with-schemas";
import { createCustomPersister } from "tinybase/persisters/with-schemas";
import { createWsSynchronizer } from "tinybase/synchronizers/synchronizer-ws-client/with-schemas";
import {
	type Content,
	createMergeableStore,
	type MergeableStore,
	type OptionalSchemas,
	type Store,
} from "tinybase/with-schemas";
import { isTauri } from "../lib/isTauri";
import {
	STORE_ID,
	TABLES_SCHEMA,
	useCreateMergeableStore,
	useCreatePersister,
	useCreateSynchronizer,
	useProvideStore,
} from "../lib/tinybase-typed";

// A unique Id for this Store.
interface InitializerProps {
	roomId: string;
}

async function createTauriPersister<Schemas extends OptionalSchemas>(
	store: Store<Schemas> | MergeableStore<Schemas>,
	storageKey: string,
) {
	const { load } = await import("@tauri-apps/plugin-store");

	const tauriStore = await load("tinybase-store.json");
	let unlistener: undefined | (() => void);
	const persister = createCustomPersister(
		store,
		async () => {
			try {
				const storeData = await tauriStore.get<Content<Schemas>>(storageKey);
				return storeData;
			} catch {}
		},
		(getContent) => tauriStore.set(storageKey, getContent()),
		async (listener) => {
			unlistener = await tauriStore.onKeyChange<Content<Schemas>>(
				storageKey,
				listener,
			);
		},
		() => unlistener?.(),
	);

	return persister;
}

console.log(JSON.stringify(import.meta.env.TAURI_ENV_PLATFORM));

export const ComponentStoreInitialiser = (props: InitializerProps) => {
	const { roomId } = props;
	// Create the Store and set its schema
	const componentsStore = useCreateMergeableStore(() =>
		createMergeableStore().setTablesSchema(TABLES_SCHEMA),
	);

	// Create a local storage persister for the Store and start it
	useCreatePersister(
		componentsStore,
		(store) => {
			if (isTauri) {
				return createTauriPersister(store, STORE_ID + roomId);
			}

			return createIndexedDbPersister(store, STORE_ID + roomId);
		},
		[roomId],
		(persister) => persister.startAutoPersisting(),
	);

	useCreateSynchronizer(
		componentsStore,
		async (store) => {
			const synchronizer = await createWsSynchronizer(
				store,
				new ReconnectingWebSocket(
					`${import.meta.env.VITE_WS_URL}/${roomId}`,
				) as WebSocket,
			);

			await synchronizer.startSync();

			// If the websocket reconnects in the future, do another explicit sync.
			synchronizer.getWebSocket().addEventListener("open", () => {
				synchronizer.load().then(() => synchronizer.save());
			});

			return synchronizer;
		},
		[roomId],
	);

	// Provide the Store for the rest of the app.
	useProvideStore(STORE_ID, componentsStore);

	// Don't render anything.
	return null;
};

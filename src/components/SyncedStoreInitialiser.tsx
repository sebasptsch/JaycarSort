// code

import { WebSocket as ReconnectingWebSocket } from "partysocket";
import { createIndexedDbPersister } from "tinybase/persisters/persister-indexed-db/with-schemas";
import { createWsSynchronizer } from "tinybase/synchronizers/synchronizer-ws-client/with-schemas";
import { createMergeableStore } from "tinybase/with-schemas";
import { isTauri } from "../lib/isTauri";
import { createTauriPersister } from "../lib/tauriPersister";
import {
	SYNCED_STORE_ID,
	SYNCED_TABLES_SCHEMA,
	useCreateMergeableStoreSynced,
	useCreatePersisterSynced,
	useCreateSynchronizerSynced,
	useProvideStoreSynced,
} from "../lib/tinybase-typed";

// A unique Id for this Store.
interface InitialiserProps {
	roomId: string;
}

export function SyncedStoreInitialiser(props: InitialiserProps) {
	const { roomId } = props;
	// Create the Store and set its schema
	const syncedStore = useCreateMergeableStoreSynced(() =>
		createMergeableStore().setTablesSchema(SYNCED_TABLES_SCHEMA),
	);

	// Create a local storage persister for the Store and start it
	useCreatePersisterSynced(
		syncedStore,
		(store) => {
			if (isTauri) {
				return createTauriPersister(store, SYNCED_STORE_ID + roomId);
			}

			return createIndexedDbPersister(store, SYNCED_STORE_ID + roomId);
		},
		[roomId],
		(persister) => persister.startAutoPersisting(),
	);

	useCreateSynchronizerSynced(
		syncedStore,
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
	useProvideStoreSynced(SYNCED_STORE_ID, syncedStore);

	// Don't render anything.
	return null;
}

// code

import { WebSocket as ReconnectingWebSocket } from "partysocket";
import { createLocalPersister } from "tinybase/persisters/persister-browser/with-schemas";
import { createWsSynchronizer } from "tinybase/synchronizers/synchronizer-ws-client/with-schemas";
import { createMergeableStore } from "tinybase/with-schemas";
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

export const ComponentStoreInitialiser = (props: InitializerProps) => {
	const { roomId } = props;
	// Create the Store and set its schema
	const componentsStore = useCreateMergeableStore(() =>
		createMergeableStore().setTablesSchema(TABLES_SCHEMA),
	);

	// Create a local storage persister for the Store and start it
	useCreatePersister(
		componentsStore,
		(store) => createLocalPersister(store, STORE_ID + roomId),
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

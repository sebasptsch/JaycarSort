import { createCustomPersister } from "tinybase/persisters/with-schemas";
import type { Content, MergeableStore, OptionalSchemas, Store } from "tinybase/with-schemas";

export async function createTauriPersister<Schemas extends OptionalSchemas>(
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
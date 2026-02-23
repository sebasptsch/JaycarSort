import CssBaseline from "@mui/material/CssBaseline";
import GlobalStyles from "@mui/material/GlobalStyles";
import {
	createTheme,
	StyledEngineProvider,
	ThemeProvider,
} from "@mui/material/styles";
import { QueryClient } from "@tanstack/react-query";
import {
	createHashHistory,
	createRouter,
	RouterProvider,
} from "@tanstack/react-router";
import { createRoot } from "react-dom/client";
import { routeTree } from "./routeTree.gen";
import "@fontsource-variable/roboto/index.css";
import "./global.css";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { Toaster } from "./components/Toaster";
import { isTauri } from "./lib/isTauri";

const theme = createTheme({
	colorSchemes: {
		dark: true,
		light: true,
	},
	palette: {
		primary: {
			main: "#0c254c",
		},
	},
	typography: {
		fontFamily: "'Roboto Variable', sans-serif",
	},
});

const queryClient = new QueryClient();

const router = createRouter({
	routeTree,
	context: {
		queryClient,
	},
	history: isTauri ? createHashHistory() : undefined,
	defaultPreload: "intent",
	// Since we're using React Query, we don't want loader calls to ever be stale
	// This will ensure that the loader is always called when the route is preloaded or visited
	defaultPreloadStaleTime: 0,
	basepath: import.meta.env.BASE_URL,
	scrollRestoration: true,
});

// Register things for typesafety
declare module "@tanstack/react-router" {
	interface Register {
		router: typeof router;
	}
}

function createTauriAsyncQueryPersister() {
	const storeName = "queryStore.json";

	const asyncStoragePersister = createAsyncStoragePersister({
		storage: {
			getItem: (key) =>
				import("@tauri-apps/plugin-store").then(({ load }) =>
					load(storeName).then(({ get }) => get(key)),
				),
			setItem: (key, value) =>
				import("@tauri-apps/plugin-store").then(({ load }) =>
					load(storeName).then(({ set }) => set(key, value)),
				),
			removeItem: (key) =>
				import("@tauri-apps/plugin-store").then(({ load }) =>
					load(storeName).then(async ({ delete: deleteItem }) => {
						await deleteItem(key);
					}),
				),
			entries: () =>
				import("@tauri-apps/plugin-store").then(({ load }) =>
					load(storeName).then(({ entries }) => entries()),
				),
		},
	});

	return asyncStoragePersister;
}

const localStoragePersister = createAsyncStoragePersister({
	storage: window.localStorage,
});

const persister = isTauri
	? createTauriAsyncQueryPersister()
	: localStoragePersister;

// biome-ignore lint/style/noNonNullAssertion: This element does exist and is predictable
createRoot(document.getElementById("root")!).render(
	<StyledEngineProvider enableCssLayer>
		<GlobalStyles styles="@layer theme, base, mui, components, utilities;" />
		<PersistQueryClientProvider
			client={queryClient}
			persistOptions={{
				persister,
			}}
		>
			<ThemeProvider theme={theme}>
				<CssBaseline />
				<RouterProvider router={router} />
				<Toaster />
			</ThemeProvider>
		</PersistQueryClientProvider>
	</StyledEngineProvider>,
);

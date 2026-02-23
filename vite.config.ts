import { cloudflare } from "@cloudflare/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

const host = process.env.TAURI_DEV_HOST;

// https://vitejs.dev/config/
export default defineConfig({
	clearScreen: false,
	server: {
		// make sure this port matches the devUrl port in tauri.conf.json file
		port: 5173,
		// Tauri expects a fixed port, fail if that port is not available
		strictPort: true,
		// if the host Tauri is expecting is set, use it
		host: host || false,
		hmr: host
			? {
					protocol: "ws",
					host,
					port: 1421,
				}
			: undefined,

		watch: {
			// tell vite to ignore watching `src-tauri`
			ignored: ["**/src-tauri/**"],
		},
	},
	// Env variables starting with the item of `envPrefix` will be exposed in tauri's source code through `import.meta.env`.
	envPrefix: ["VITE_", "TAURI_ENV_*"],
	build: {
		// Tauri uses Chromium on Windows and WebKit on macOS and Linux
		target:
			process.env.TAURI_ENV_PLATFORM === "windows" ? "chrome105" : "safari13",
		// don't minify for debug builds
		minify: !process.env.TAURI_ENV_DEBUG ? "esbuild" : false,
		// produce sourcemaps for debug builds
		sourcemap: !!process.env.TAURI_ENV_DEBUG,
	},
	plugins: [
		cloudflare(),
		tailwindcss(),
		tanstackRouter({
			target: "react",
			autoCodeSplitting: true,
		}),
		react({
			babel: {
				plugins: [
					"babel-plugin-react-compiler",
					[
						"@emotion",
						{
							importMap: {
								"@mui/system": {
									styled: {
										canonicalImport: ["@emotion/styled", "default"],
										styledBaseImport: ["@mui/system", "styled"],
									},
								},
								"@mui/material": {
									styled: {
										canonicalImport: ["@emotion/styled", "default"],
										styledBaseImport: ["@mui/material", "styled"],
									},
								},
								"@mui/material/styles": {
									styled: {
										canonicalImport: ["@emotion/styled", "default"],
										styledBaseImport: ["@mui/material/styles", "styled"],
									},
								},
							},
						},
					],
					[
						"babel-plugin-direct-import",
						{
							modules: ["@mui/system", "@mui/material", "@mui/icons-material"],
						},
					],
				],
			},
		}),
	],
});

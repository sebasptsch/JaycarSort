import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		tailwindcss(),
		tanstackRouter({
			target: "react",
			autoCodeSplitting: true,
		}),
		react({
			babel: {
				plugins: [
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
				],
			},
		}),
		VitePWA({
			registerType: "autoUpdate",
			injectRegister: "auto",
			manifest: {
				name: "JaycarSort",
				short_name: "JaycarSort",
				icons: [
					{
						src: "/JaycarSort/turbine.jpg",
						sizes: "200x200 any",
						type: "image/jpg",
						purpose: "any maskable",
					},
				],
				theme_color: "#ffffff",
				background_color: "#0c254c",
				display: "standalone",
			},
		}),
	],
});

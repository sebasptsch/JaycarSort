import { mutationOptions } from "@tanstack/react-query";
import type { ScanOptions } from "@tauri-apps/plugin-barcode-scanner";
import { toaster } from "../components/Toaster";

export const tauriScanMutationOptions = mutationOptions({
	mutationFn: async (scanOptions?: ScanOptions) => {
		const { scan, openAppSettings, checkPermissions } = await import(
			"@tauri-apps/plugin-barcode-scanner"
		);

		const permissions = await checkPermissions();

		if (permissions === "denied") await openAppSettings();

		if (permissions === "prompt") await openAppSettings();

		return scan(scanOptions);
	},
	onError: (error) => {
		toaster.error({
			title: "Error occured",
			description: JSON.stringify(error, null, 2),
		});
	},
});

import { Button, InputAdornment } from "@mui/material";
import { useMutation, useQuery } from "@tanstack/react-query";
import type { ScanOptions } from "@tauri-apps/plugin-barcode-scanner";
import { useQueries } from "tinybase/ui-react";
import { getIsMobile } from "../lib/isTauri";
import { toaster } from "./Toaster";

interface ScanButtonProps {
	setSearch: (v: string) => void;
}

export default function ScanAdornment(props: ScanButtonProps) {
	const mutation = useMutation({
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
		onSuccess: (data) => {
			setSearch(data.content);
		},
	});

	const { setSearch } = props;

	const isMobileQuery = useQuery({
		queryFn: () => getIsMobile(),
		queryKey: ["isMobile"],
		initialData: false,
	});

	if (!isMobileQuery.data) {
		return null;
	}

	return (
		<InputAdornment position="end">
			<Button
				size="small"
				variant="contained"
				loading={mutation.isPending}
				onClick={() => mutation.mutate({})}
			>
				Scan
			</Button>
		</InputAdornment>
	);
}

import { zodResolver } from "@hookform/resolvers/zod";
import { Button, InputAdornment, Stack } from "@mui/material";
import { useMutation } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Format } from "@tauri-apps/plugin-barcode-scanner";
import { useState } from "react";
import { useForm } from "react-hook-form";
import z, { type output } from "zod";
import ControlledCheckbox from "../../components/ControlledCheckbox";
import ControlledSelect from "../../components/ControlledSelect";
import ControlledTextField from "../../components/ControlledTextField";
import { LinkButton } from "../../components/LinkButton";
import { toaster } from "../../components/Toaster";
import { tauriScanMutationOptions } from "../../hooks/useTauriScan";
import { dbItemSchema } from "../../lib/interfaces";
import { isTauri } from "../../lib/isTauri";
import { STORE_ID, useSetRowCallback } from "../../lib/tinybase-typed";

export const Route = createFileRoute("/$roomId/add")({
	component: RouteComponent,
});

const fetchFromApi = async (barcode: string) => {
	const token = window.localStorage.getItem("token");

	if (!token) throw new Error("No login");

	const barcodeResponse = await fetch(
		`${import.meta.env.VITE_NODE_API_URL}/products/${barcode}/product-by-scanner`,
		{
			headers: {
				Authorization: `Bearer ${token}`,
			},
		},
	)
		.then((res) => res.json())
		.catch((err) =>
			toaster.error({
				title: "an error occured",
				description: err.toString(),
			}),
		);

	return barcodeResponse as {
		p_prodnumber: string;
		p_proddescsystem: string;
	};
};

const formSchema = dbItemSchema.extend({
	fillFromApi: z.boolean(),
});

function RouteComponent() {
	// const addComponentMutation = useAddComponent();
	const [lastScan, setLastScan] = useState<string>();

	const { control, handleSubmit, setValue, getValues } = useForm({
		resolver: zodResolver(formSchema),
	});

	const setRowHandler = useSetRowCallback(
		"components",
		({ item }: Omit<output<typeof formSchema>, "fillFromApi">) => item,
		(params) => params,
		[],
		STORE_ID,
		(_store, row) => {
			if (row.barcode && lastScan !== row.barcode) {
				setValue("tray", (row.tray ?? 0) + 1);
				setLastScan(row.barcode);
			}
			setValue("barcode", "");
			console.log("added", row);
		},
		[setValue, setLastScan, lastScan, getValues],
	);

	const onSubmit = handleSubmit(async (data) => {
		try {
			if (data.fillFromApi) {
				const apiData = await fetchFromApi(data.barcode.toString());
				console.log("row handler", data);
				setRowHandler({
					...data,
					item: apiData.p_prodnumber,
					description: apiData.p_proddescsystem,
				});
			} else {
				console.log("row handler", data);
				setRowHandler(data);
			}
			if (isTauri) {
				try {
					await import("@tauri-apps/plugin-haptics").then(
						({ notificationFeedback }) => notificationFeedback("success"),
					);
				} catch {}
			}
		} catch (e: unknown) {
			toaster.error({
				title: "An error occured",
				description: e instanceof Error ? e.toString() : "Unknown Error",
			});
			console.error(e);
			if (isTauri) {
				try {
					await import("@tauri-apps/plugin-haptics").then(
						({ notificationFeedback }) => notificationFeedback("error"),
					);
				} catch {}
			}
		}
	});

	return (
		<Stack component={"form"} className="gap-2" onSubmit={onSubmit}>
			<LinkButton to="/login">Login to JEG</LinkButton>
			<ControlledCheckbox
				control={control}
				name="fillFromApi"
				label="Fill from API"
				defaultValue={false}
			/>
			<ControlledSelect
				control={control}
				name="location"
				options={dbItemSchema.shape.location.options.map((opt) => ({
					label: opt,
					value: opt,
				}))}
				defaultValue={"Turbine"}
				label="Location"
				helperText={"What sort of storage is the part located in"}
				required
			/>
			<Stack direction={"row"} gap={1} className="w-full">
				<ControlledTextField
					control={control}
					name="unit"
					defaultValue={"A"}
					label={"Unit"}
					required
					fullWidth
				/>
				<ControlledTextField
					control={control}
					name="shelf"
					valueAsNumber
					defaultValue={1}
					label={"Shelf"}
					required
					fullWidth
				/>
				<ControlledTextField
					control={control}
					name="tray"
					valueAsNumber
					defaultValue={1}
					label={"Tray"}
					required
					fullWidth
				/>
			</Stack>
			<ControlledTextField
				control={control}
				name="barcode"
				defaultValue={""}
				label="Barcode"
				helperText="The barcode on the label"
				required
				slotProps={{
					input: {
						endAdornment: (
							<ScanButton
								setSearch={(v) => {
									setValue("barcode", v);
								}}
							/>
						),
					},
				}}
			/>
			<ControlledTextField
				control={control}
				name="item"
				defaultValue={"PA3500"}
				label="Cat No."
				helperText="The Catalog Number, normally two letters followed by four numbers"
				required
			/>
			<ControlledTextField
				control={control}
				name="description"
				defaultValue=""
				label={"Description"}
				helperText="The description, optional for the component"
			/>
			<Button type="submit" variant="contained">
				Save
			</Button>
		</Stack>
	);
}

interface ScanButtonProps {
	setSearch: (v: string) => void;
}

function ScanButton(props: ScanButtonProps) {
	const mutation = useMutation({
		...tauriScanMutationOptions,
		onSuccess: (data) => {
			setSearch(data.content);
		},
	});

	const { setSearch } = props;

	if (!isTauri) {
		return null;
	}

	return (
		<InputAdornment position="end">
			<Button
				loading={mutation.isPending}
				onClick={() =>
					mutation.mutate({
						formats: [Format.EAN13],
					})
				}
			>
				Scan
			</Button>
		</InputAdornment>
	);
}

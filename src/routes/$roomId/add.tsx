import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Divider, Stack } from "@mui/material";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { type Control, useForm, useWatch } from "react-hook-form";
import z, { type output } from "zod";
import ControlledCheckbox from "../../components/ControlledCheckbox";
import ScanningControlledTextField from "../../components/ControlledScanningTextField";
import ControlledSelect from "../../components/ControlledSelect";
import ControlledTextField from "../../components/ControlledTextField";
import { LinkButton } from "../../components/LinkButton";
import { toaster } from "../../components/Toaster";
import type { extractResolverFields } from "../../lib/form";
import { dbItemSchema } from "../../lib/interfaces";
import { isMobile } from "../../lib/isTauri";
import {
	SYNCED_STORE_ID,
	useSetRowCallbackSynced,
} from "../../lib/tinybase-typed";

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
	).then((res) => res.json());

	return barcodeResponse as {
		p_prodnumber: string;
		p_proddescsystem: string;
		p_prodBarcodePrimary: string;
	};
};

const formSchema = dbItemSchema.extend({
	fillFromApi: z.boolean(),
});

const formSchemaResolver = zodResolver(formSchema);

function RouteComponent() {
	const [lastScan, setLastScan] = useState<string>();

	const { control, handleSubmit, setValue, getValues } = useForm({
		resolver: formSchemaResolver,
		defaultValues: {
			barcode: "",
			description: "",
			fillFromApi: false,
			item: "",
			location: "Turbine",
			shelf: 1,
			tray: 1,
			unit: "1",
		},
	});

	const setRowHandler = useSetRowCallbackSynced(
		"components",
		({ item }: Omit<output<typeof formSchema>, "fillFromApi">) => item,
		(params) => params,
		[],
		SYNCED_STORE_ID,
		(_store, row) => {
			if (row.barcode && lastScan !== row.barcode) {
				setValue("tray", (row.tray ?? 0) + 1);
				setLastScan(row.barcode);
			}
			setValue("barcode", "");
		},
		[setValue, setLastScan, lastScan, getValues],
	);

	const onSubmit = handleSubmit(async (data) => {
		try {
			if (data.fillFromApi) {
				const apiData = await fetchFromApi(data.barcode.toString());
				setRowHandler({
					...data,
					item: apiData.p_prodnumber,
					description: apiData.p_proddescsystem,
					barcode: apiData.p_prodBarcodePrimary ?? data.barcode,
				});

				toaster.success({
					title: "Successfully added item!",
					description: `Successfully added ${apiData.p_prodnumber} to the store.`,
				});
			} else {
				setRowHandler(data);

				toaster.success({
					title: "Successfully added item!",
					description: `Successfully added ${data.item} to the store.`,
				});
			}

			if (isMobile) {
				await import("@tauri-apps/plugin-haptics").then(
					({ notificationFeedback }) => notificationFeedback("success"),
				);
			}
		} catch (e: unknown) {
			toaster.error({
				title: "An error occured",
				description: e instanceof Error ? e.toString() : "Unknown Error",
			});
			if (isMobile) {
				await import("@tauri-apps/plugin-haptics").then(
					({ notificationFeedback }) => notificationFeedback("error"),
				);
			}
		}
	});

	return (
		<Stack component={"form"} gap={2} onSubmit={onSubmit}>
			<Divider>Autofill</Divider>
			<LinkButton to="/login" variant="contained">
				Login using ICS
			</LinkButton>
			<ControlledCheckbox
				control={control}
				name="fillFromApi"
				label="Fill from API"
				defaultValue={false}
			/>
			<Divider>Location</Divider>
			<ControlledSelect
				control={control}
				name="location"
				options={dbItemSchema.shape.location.options.map((opt) => ({
					label: opt,
					value: opt,
				}))}
				label="Location"
				helperText={"What sort of storage is the part located in"}
				required
			/>
			<ItemLocationInput control={control} />
			<Divider>Details</Divider>

			<ManualItemDetailsInput control={control} />
			<Button type="submit" variant="contained">
				Save
			</Button>
		</Stack>
	);
}

interface SubFormInputProps {
	control: Control<extractResolverFields<typeof formSchemaResolver>>;
}

function ItemLocationInput(props: SubFormInputProps) {
	const { control } = props;
	const selectedLocation = useWatch({ control, name: "location" });

	const shelfLabel = selectedLocation === "Capstan" ? "Column" : "Shelf";

	const trayLabel =
		selectedLocation === "Capstan"
			? "Row"
			: selectedLocation === "Turbine"
				? "Tray"
				: "Position";

	return (
		<Stack direction={"row"} gap={1} className="w-full">
			<ControlledTextField
				control={control}
				name="unit"
				label={selectedLocation}
				required
				fullWidth
			/>
			<ControlledTextField
				control={control}
				name="shelf"
				valueAsNumber
				label={shelfLabel}
				required
				fullWidth
			/>
			<ControlledTextField
				control={control}
				name="tray"
				valueAsNumber
				label={trayLabel}
				required
				fullWidth
			/>
		</Stack>
	);
}

function ManualItemDetailsInput(props: SubFormInputProps) {
	const { control } = props;

	const fillEnabled = useWatch({ control, name: "fillFromApi" });

	return (
		<>
			<ScanningControlledTextField
				control={control}
				name="barcode"
				label={fillEnabled ? "Lookup" : "Barcode"}
				helperText={fillEnabled ? "The barcode or part number" : "The barcode"}
				required
			/>
			<ControlledTextField
				control={control}
				name="item"
				defaultValue={"PA3500"}
				label="Cat No."
				helperText="The Catalog Number, normally two letters followed by four numbers"
				required={!fillEnabled}
				hidden={fillEnabled}
				disabled={fillEnabled}
			/>
			<ControlledTextField
				control={control}
				name="description"
				defaultValue=""
				label={"Description"}
				helperText="The description, optional for the component"
				hidden={fillEnabled}
				required={!fillEnabled}
				disabled={fillEnabled}
			/>
		</>
	);
}

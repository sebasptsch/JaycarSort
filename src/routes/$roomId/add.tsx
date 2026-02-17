import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Stack } from "@mui/material";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import z, { type output } from "zod";
import ControlledCheckbox from "../../components/ControlledCheckbox";
import ControlledSelect from "../../components/ControlledSelect";
import ControlledTextField from "../../components/ControlledTextField";
import { LinkButton } from "../../components/LinkButton";
import { toaster } from "../../components/Toaster";
import { dbItemSchema } from "../../lib/interfaces";
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

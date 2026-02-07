import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Stack } from "@mui/material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import z from "zod";
import ControlledCheckbox from "../components/ControlledCheckbox";
import ControlledSelect from "../components/ControlledSelect";
import ControlledTextField from "../components/ControlledTextField";
import { toaster } from "../components/Toaster";
import { type DBItem, dbItemSchema } from "../lib/interfaces";
import { db, regenerateIndex } from "../lib/lunr";

export const Route = createFileRoute("/add")({
	component: RouteComponent,
});

async function addSingleComponent(dbItem: DBItem) {
	(await db).put("components", dbItem);
}

function useAddComponent() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: addSingleComponent,
		onSuccess: (_data, vars) => {
			toaster.success({
				title: `Added Component: ${vars.item}`,
			});
			regenerateIndex();
			queryClient.invalidateQueries({
				queryKey: ["components"],
				exact: false,
			});
		},
	});
}

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
		.catch((err) => console.error(err));

	return barcodeResponse as {
		p_prodnumber: string;
		p_proddescsystem: string;
	};
};

function RouteComponent() {
	const addComponentMutation = useAddComponent();

	const { control, handleSubmit, setValue, getValues } = useForm({
		resolver: zodResolver(
			dbItemSchema.extend({
				fillFromApi: z.boolean(),
			}),
		),
	});

	const onSubmit = handleSubmit(async (data) => {
		if (data.fillFromApi) {
			const apiData = await fetchFromApi(data.barcode.toString());
			await addComponentMutation.mutateAsync({
				...data,
				item: apiData.p_prodnumber,
				description: apiData.p_proddescsystem,
			});
		} else {
			await addComponentMutation.mutateAsync(data);
		}

		const currentValues = getValues("tray");
		setValue("tray", currentValues + 1);
	});

	return (
		<Stack component={"form"} className="gap-2" onSubmit={onSubmit}>
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
			<ControlledTextField
				control={control}
				name="unit"
				defaultValue={"A"}
				label={"Unit"}
				helperText={
					"The number or identifier for the unit e.g. Capston 1 or Turbine C"
				}
				required
			/>
			<ControlledTextField
				control={control}
				name="shelf"
				valueAsNumber
				defaultValue={1}
				label={"Shelf"}
				helperText={"The shelf the item is on (y) axis"}
				required
			/>
			<ControlledTextField
				control={control}
				name="tray"
				valueAsNumber
				defaultValue={1}
				label={"Tray"}
				helperText={"The tray (x) axis"}
				required
			/>

			<ControlledTextField
				control={control}
				name="barcode"
				defaultValue={0}
				label="Barcode"
				helperText="The barcode on the label"
				required
				valueAsNumber
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

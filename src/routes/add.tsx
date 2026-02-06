import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Stack } from "@mui/material";
import { useMutation } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import ControlledSelect from "../components/ControlledSelect";
import ControlledTextField from "../components/ControlledTextField";
import { toaster } from "../components/Toaster";
import { type DBItem, dbItemSchema } from "../lib/interfaces";
import { db } from "../lib/lunr";

export const Route = createFileRoute("/add")({
	component: RouteComponent,
});

async function addSingleComponent(dbItem: DBItem) {
	(await db).put("components", dbItem);
}

function useAddComponent() {
	return useMutation({
		mutationFn: addSingleComponent,
		onSuccess: (_data, vars) => {
			toaster.success({
				title: `Added Component: ${vars.item}`,
			});
		},
	});
}

function RouteComponent() {
	const addComponentMutation = useAddComponent();

	const { control, handleSubmit, setValue, getValues } = useForm({
		resolver: zodResolver(dbItemSchema),
	});

	const onSubmit = handleSubmit(async (data) => {
		await addComponentMutation.mutateAsync(data);
		const currentValues = getValues("tray");
		setValue("tray", currentValues + 1);
	});

	return (
		<Stack component={"form"} className="gap-2" onSubmit={onSubmit}>
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

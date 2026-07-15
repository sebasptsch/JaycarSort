import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Stack } from "@mui/material";
import { createFileRoute } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import z from "zod";
import ScanningControlledTextField from "../components/ControlledScanningTextField";

export const Route = createFileRoute("/")({
	component: RouteComponent,
});

function RouteComponent() {
	const { control, handleSubmit } = useForm({
		resolver: zodResolver(
			z.object({
				roomId: z.string(),
			}),
		),
	});

	const navigate = Route.useNavigate();

	const onSubmit = handleSubmit((data) => {
		navigate({
			to: "/$roomId",
			params: {
				roomId: data.roomId,
			},
		});
	});

	return (
		<Stack component={"form"} onSubmit={onSubmit}>
			<ScanningControlledTextField
				control={control}
				name="roomId"
				defaultValue=""
				label="Room Identifier"
				helperText="Unique code that allows other devices to sync with each other."
			/>
			<Button type="submit">Join</Button>
		</Stack>
	);
}

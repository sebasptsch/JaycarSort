import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Stack } from "@mui/material";
import { createFileRoute } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import z from "zod";
import ControlledTextField from "../components/ControlledTextField";

export const Route = createFileRoute("/login")({
	component: RouteComponent,
});

function RouteComponent() {
	const {
		control,
		handleSubmit,
		formState: { isSubmitting },
	} = useForm({
		resolver: zodResolver(
			z.object({
				username: z.string(),
				password: z.string(),
				app_id: z.number(),
			}),
		),
		defaultValues: {
			username: "",
			password: "",
			app_id: 4,
		},
	});

	const onSubmit = handleSubmit(async (data) => {
		const loginResponse = await fetch(
			`${import.meta.env.VITE_NODE_API_URL}/login`,
			{
				method: "post",
				body: JSON.stringify(data),
				headers: {
					"Content-Type": "application/json",
				},
			},
		);

		const parsedJson = await loginResponse.json();

		window.localStorage.setItem("token", parsedJson.node_token);

		console.log("Logged in");
	});

	return (
		<Stack className="gap-2" component="form" onSubmit={onSubmit}>
			<ControlledTextField
				control={control}
				name="username"
				label="Username"
				required
			/>
			<ControlledTextField
				type="password"
				control={control}
				name="password"
				label="Password"
				required
			/>
			<Button type={"submit"} loading={isSubmitting}>
				Login
			</Button>
		</Stack>
	);
}

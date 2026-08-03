import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, AlertTitle, Button, Container, Stack } from "@mui/material";
import { useMutation } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import z from "zod";
import ControlledTextField from "../components/ControlledTextField";
import { toaster } from "../components/Toaster";

export const Route = createFileRoute("/login")({
	component: RouteComponent,
});

const formSchema = z.object({
	username: z.string(),
	password: z.string(),
	app_id: z.number(),
});

function RouteComponent() {
	const {
		control,
		handleSubmit,
		formState: { isSubmitting },
	} = useForm({
		resolver: zodResolver(formSchema),
		defaultValues: {
			username: "",
			password: "",
			app_id: 4,
		},
	});

	const loginMutation = useMutation({
		mutationFn: async (data: z.output<typeof formSchema>) => {
			const response = await fetch(`${import.meta.env.VITE_API_URL}/login`, {
				method: "post",
				body: JSON.stringify(data),
				headers: {
					"Content-Type": "application/json",
				},
			});

			if (!response.ok)
				throw new Error("Request not okay", {
					cause: response,
				});

			return response.json();
		},
		onError: (err) => {
			toaster.error({
				title: "An error occured",
				description: err.toString(),
			});
		},

		onSuccess: (loginResponse) => {
			window.localStorage.setItem("token", loginResponse.node_token);
			toaster.success({
				title: "Logged In",
			});

			console.log("Logged in");
		}
	});

	const onSubmit = handleSubmit((data) => loginMutation.mutateAsync(data))

	return (
		<Container maxWidth="sm">
			<Stack className="gap-4" component="form" onSubmit={onSubmit}>
				<Alert severity="info">
					<AlertTitle>Info</AlertTitle>
					Use your internal credentials to login and pull data from ICS.
					<br /><br />
					This is <b>only available on devices that are able to use ICS 2</b>. Namely PDTs and Chrome on POS computers (not the remote desktop).
				</Alert>
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
				<Button type={"submit"} loading={isSubmitting} variant="contained">
					Login
				</Button>
			</Stack>
		</Container>
	);
}

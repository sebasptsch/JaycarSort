import { Box, Container } from "@mui/material";
import { type QueryClient, useMutation } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import {
	createRootRouteWithContext,
	Link,
	Outlet,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import type { CheckOptions, Update } from "@tauri-apps/plugin-updater";
import { useEffect } from "react";
import { toaster } from "../components/Toaster";
import TopBar from "../components/TopBar";

export const Route = createRootRouteWithContext<{
	queryClient: QueryClient;
}>()({
	component: RootComponent,
	notFoundComponent: () => {
		return (
			<div>
				<p>This is the notFoundComponent configured on root route</p>
				<Link to="/">Start Over</Link>
			</div>
		);
	},
});

function RootComponent() {
	return (
		<Box className="grow flex flex-col">
			<TopBar />
			<Container className="py-2 grow flex flex-col">
				<Outlet />
			</Container>
			<UpdateChecker />
			<ReactQueryDevtools buttonPosition="bottom-left" />
			<TanStackRouterDevtools position="bottom-right" />
		</Box>
	);
}

function UpdateChecker() {
	const downloadMutation = useMutation({
		mutationFn: async (data: Update) => {
			let downloaded = 0;
			let contentLength = 0;
			const { relaunch } = await import("@tauri-apps/plugin-process");
			await data.downloadAndInstall((event) => {
				switch (event.event) {
					case "Started": {
						if (event.data.contentLength)
							contentLength = event.data.contentLength;

						toaster.loading({
							id: "update",
							title: "Update",
							description: `Downloading ${contentLength} bytes`,
						});
						console.log(
							`started downloading ${event.data.contentLength} bytes`,
						);
						break;
					}
					case "Progress": {
						downloaded += event.data.chunkLength;
						console.log(`downloaded ${downloaded} from ${contentLength}`);
						toaster.loading({
							id: "update",
							title: "Update",
							description: `Downloading (${Math.round((downloaded / contentLength) * 100)}%)`,
						});
						break;
					}
					case "Finished": {
						toaster.success({
							id: "update",
							title: "Update",
							description: "Successfully downloaded update, restart now?",
							action: {
								label: "Restart",
								onClick: () => relaunch(),
							},
						});
						break;
					}
				}
			});
		},
	});

	const checkMutation = useMutation({
		mutationFn: async (options?: CheckOptions) => {
			const { check } = await import("@tauri-apps/plugin-updater");
			return check(options);
		},
		onSuccess: async (nullOrUpdate) => {
			if (nullOrUpdate === null) {
				toaster.info({
					title: "Update",
					id: "update",
					description: "No update found",
				});
			} else {
				toaster.info({
					title: "Update",
					id: "update",
					description: "Update Found! Download?",
					action: {
						label: "Download and Install",
						onClick: () => downloadMutation.mutate(nullOrUpdate),
					},
				});
			}
		},
	});

	useEffect(() => {
		checkMutation.mutate(undefined);
	}, [checkMutation.mutate]);

	return null;
}

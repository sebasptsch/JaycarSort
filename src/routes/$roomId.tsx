import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Provider } from "tinybase/ui-react";
import { ComponentStoreInitialiser } from "../components/Store";

export const Route = createFileRoute("/$roomId")({
	component: RouteComponent,
});

function RouteComponent() {
	const roomId = Route.useParams();

	return (
		<Provider>
			<ComponentStoreInitialiser roomId={roomId.roomId} />
			<Outlet />
		</Provider>
	);
}

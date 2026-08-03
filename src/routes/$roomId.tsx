import { createFileRoute, Outlet } from "@tanstack/react-router";
import { SyncedStoreInitialiser } from "../components/SyncedStoreInitialiser";

export const Route = createFileRoute("/$roomId")({
	component: RouteComponent,
});

function RouteComponent() {
	const roomId = Route.useParams();

	return (
		<>
			<SyncedStoreInitialiser roomId={roomId.roomId} />
			<Outlet />
		</>
	);
}

import { zodResolver } from "@hookform/resolvers/zod";
import {
	Button,
	Container,
	Divider,
	List,
	ListItemButton,
	Stack,
} from "@mui/material";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { DateTime } from "luxon";
import { useCallback } from "react";
import { useForm } from "react-hook-form";
import z from "zod";
import ScanningControlledTextField from "../components/ControlledScanningTextField";
import {
	LOCAL_STORE_ID,
	useSetRowCallbackLocal,
	useTableLocal,
} from "../lib/tinybase-typed";

export const Route = createFileRoute("/")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<Stack gap={2} divider={<Divider />}>
			<JoinRoomControls />
			<RecentRoomsList />
		</Stack>
	);
}

function JoinRoomControls() {
	const { control, handleSubmit } = useForm({
		resolver: zodResolver(
			z.object({
				roomId: z.string(),
			}),
		),
	});

	const navigate = Route.useNavigate();

	const updateLastUsed = useSetRowCallbackLocal(
		"recentRooms",
		(input: string) => input,
		(inputParam) => ({ roomId: inputParam, lastUsed: DateTime.now().toISO() }),
		[],
		LOCAL_STORE_ID,
		(_, row) => {
			console.log("updated last used", JSON.stringify(row, null, 2));
		},
	);

	const onSubmit = handleSubmit((data) => {
		updateLastUsed(data.roomId);

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

const sortDateTimes = (a: DateTime, b: DateTime) =>
	a < b ? -1 : a > b ? 1 : 0;

function RecentRoomsList() {
	const table = useTableLocal("recentRooms", LOCAL_STORE_ID);

	return (
		<Container maxWidth="md">
			<List>
				{Object.values(table)
					.sort(({ lastUsed: dateA }, { lastUsed: dateB }) =>
						sortDateTimes(DateTime.fromISO(dateB), DateTime.fromISO(dateA)),
					)
					.map((recentRoom) => (
						<RecentRoomListItem
							key={recentRoom.roomId}
							roomId={recentRoom.roomId}
						/>
					))}
			</List>
		</Container>
	);
}

interface RecentRoomListItemProps {
	roomId: string;
}

function RecentRoomListItem(props: RecentRoomListItemProps) {
	const { roomId } = props;
	const navigate = useNavigate();

	const updateLastUsed = useSetRowCallbackLocal(
		"recentRooms",
		(input: string) => input,
		(inputParam) => ({ roomId: inputParam, lastUsed: DateTime.now().toISO() }),
		[],
		LOCAL_STORE_ID,
		(_, row) => {
			console.log("updated last used", JSON.stringify(row, null, 2));
		},
	);

	const handleClick = useCallback(() => {
		updateLastUsed(roomId);

		navigate({
			to: "/$roomId",
			params: {
				roomId,
			},
		});
	}, [navigate, updateLastUsed, roomId]);

	return <ListItemButton onClick={handleClick}>{roomId}</ListItemButton>;
}

import type TauriWebSocket from "@tauri-apps/plugin-websocket";
import type { Message } from "@tauri-apps/plugin-websocket";
import {
	createCustomSynchronizer,
	type Receive,
} from "tinybase/synchronizers/with-schemas";
import type {
	IdOrNull,
	MergeableStore,
	OptionalSchemas,
} from "tinybase/with-schemas";

const MESSAGE_SEPARATOR = "\n";

// biome-ignore lint/suspicious/noExplicitAny: 3rd party code
const slice = <ArrayOrString extends string | any[]>(
	arrayOrString: ArrayOrString,
	start: number,
	end?: number,
): ArrayOrString => arrayOrString.slice(start, end) as ArrayOrString;

export const ifPayloadValid = (
	payload: string,
	then: (clientId: string, remainder: string) => void,
) => {
	const splitAt = payload.indexOf(MESSAGE_SEPARATOR);
	if (splitAt !== -1) {
		then(slice(payload, 0, splitAt), slice(payload, splitAt + 1));
	}
};

export const receivePayload = (payload: string, receive: Receive) =>
	ifPayloadValid(payload, (fromClientId, remainder) =>
		receive(
			fromClientId,
			...(jsonParseWithUndefined(remainder) as [
				requestId: IdOrNull,
				message: Message,
				body: any,
			]),
		),
	);

export const createPayload = (
	toClientId: IdOrNull,
	...args: [requestId: IdOrNull, message: Message, body: any]
): string =>
	createRawPayload(toClientId ?? EMPTY_STRING, jsonStringWithUndefined(args));

export const createRawPayload = (clientId: Id, remainder: string): string =>
	clientId + MESSAGE_SEPARATOR + remainder;

export const createTauriSynchronizer = <Schemas extends OptionalSchemas>(
	store: MergeableStore<Schemas>,
	webSocket: TauriWebSocket,
) => {
	const addEventListener = (handler: (msg: Message) => void) => {
		webSocket.addListener(handler);
	};

	const registerReceive = (receive: Receive) =>
		addEventListener(({ data }) =>
			receivePayload(data.toString(UTF8), receive),
		);

	const send = (
		toClientId: IdOrNull,
		...args: [requestId: IdOrNull, message: Message, body: any]
	): void => webSocket.send(createPayload(toClientId, ...args));

	const destroy = (): void => {
		webSocket.disconnect();
	};

	const synchronizer = createCustomSynchronizer(
		store,
		send,
		registerReceive,
		destroy,
		requestTimeoutSeconds,
		onSend,
		onReceive,
		onIgnoredError,
		{ getWebSocket: () => webSocket },
	);
};

import { DurableObject } from "cloudflare:workers";

interface Data {
	id?: string;
}

export class WebSocketHibernationServer extends DurableObject {
	sessions: Map<WebSocket, Data>;
	storage: DurableObjectStorage;

	constructor(ctx: DurableObjectState, env: Env) {
		super(ctx, env);
		this.storage = ctx.storage;

		//keep track of connected sessions
		this.sessions = new Map<WebSocket, Data>();
		this.ctx.getWebSockets().forEach((ws) => {
			this.sessions.set(ws, { ...ws.deserializeAttachment() });
		});
	}

	async fetch(_req: Request) {
		const pair = new WebSocketPair();
		this.ctx.acceptWebSocket(pair[1]);
		this.sessions.set(pair[1], {});
		return new Response(null, { status: 101, webSocket: pair[0] });
	}
	webSocketMessage(ws: WebSocket, msg: string | ArrayBuffer) {
		const session = this.sessions.get(ws);
		if (session !== undefined && session.id === undefined) {
			session.id = crypto.randomUUID();
			ws.serializeAttachment({ ...ws.deserializeAttachment(), id: session.id });
		}
		this.broadcast(ws, msg);
	}
	broadcast(sender: WebSocket, msg: string | NonNullable<unknown>) {
		const id = this.sessions.get(sender)?.id;
		for (const [ws, data] of this.sessions) {
			if (id === data.id) continue;
			switch (typeof msg) {
				case "string":
					ws.send(msg);
					break;
				default:
					ws.send(JSON.stringify(msg));
					break;
			}
		}
	}
	close(ws: WebSocket) {
		const session = this.sessions.get(ws);
		if (!session?.id) return;
		this.sessions.delete(ws);
	}
	webSocketClose(ws: WebSocket) {
		this.close(ws);
	}
	webSocketError(ws: WebSocket) {
		this.close(ws);
	}
}

export default {
	async fetch(request: Request, env: Env) {
		const upgrade = request.headers.get("Upgrade");
		if (!upgrade || upgrade !== "websocket") {
			return new Response("Expected upgrade to websocket", { status: 426 });
		}
		const id = env.WEBSOCKET_HIBERNATION_SERVER.idFromName(
			new URL(request.url).pathname,
		);
		const websocketDO = env.WEBSOCKET_HIBERNATION_SERVER.get(id);
		return websocketDO.fetch(request);
	},
};

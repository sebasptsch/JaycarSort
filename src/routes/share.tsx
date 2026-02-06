import { Button } from "@mui/material";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import z from "zod";

export const Route = createFileRoute("/share")({
	validateSearch: z.object({
		initiator: z.boolean().default(false),
	}),
	component: RouteComponent,
});

interface Candidate {
	type: "candidate";
	candidate: RTCIceCandidateInit;
}

function RouteComponent() {
	const initiator = Route.useSearch({
		select: (s) => s.initiator,
	});

	const socket = useRef<WebSocket>(null);

	const peer = useRef<RTCPeerConnection>(null);

	useEffect(() => {
		socket.current = new WebSocket("wss://jaycarsort.sebasptsch.workers.dev/api/ws");

		const ws = socket.current;

		peer.current = new RTCPeerConnection({
			iceServers: [{ urls: "stun:stun.cloudflare.com:3478" }],
		});

		const webrtcPeer = peer.current;
		webrtcPeer.addEventListener("icecandidate", (e) => {
			if (e.candidate) {
				ws.send(
					JSON.stringify({
						type: "candidate",
						candidate: e.candidate,
					} satisfies Candidate),
				);
			}
		});

		webrtcPeer.addEventListener("connectionstatechange", () => {
			console.log("connection state changed");
		});

		ws.addEventListener("message", async (ev) => {
			const data = JSON.parse(ev.data) as RTCSessionDescriptionInit | Candidate;

			switch (data.type) {
				case "offer": {
					await webrtcPeer.setRemoteDescription(data);
					const answer = await webrtcPeer.createAnswer();
					await webrtcPeer.setLocalDescription(answer);
					ws.send(JSON.stringify(answer));
					return;
				}
				case "answer": {
					await webrtcPeer.setRemoteDescription(data);
					return;
				}
				case "candidate": {
					try {
						await webrtcPeer.addIceCandidate(data.candidate);
					} catch (e) {
						console.log("Error adding ice candidate", e);
					}
				}
			}
		});

		return () => {
			webrtcPeer.close();
			ws.close();
		};
	}, []);

	const handleOffer = async () => {
		if (!peer.current || !socket.current) return;
		const offer = await peer.current.createOffer();
		await peer.current.setLocalDescription(offer);
		socket.current.send(JSON.stringify(offer));
	};

	const handleClose = async () => {
		console.log("receivers", peer.current?.getReceivers());
		console.log("senders", peer.current?.getSenders());
		console.log("senders", peer.current?.connectionState);
	};

	return (
		<>
			<Button onClick={handleOffer}>Hello "/share"!</Button>
			<Button onClick={handleClose}>Close</Button>
		</>
	);
}

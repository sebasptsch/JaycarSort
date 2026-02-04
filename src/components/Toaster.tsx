import { Alert, AlertTitle } from "@mui/material";
import { normalizeProps, useMachine } from "@zag-js/react";
import * as toast from "@zag-js/toast";
import { useId } from "react";

// 1. Create the toast store
export const toaster = toast.createStore({
	overlap: true,
	placement: "bottom-start",
});

interface ToastProps {
	actor: toast.Options<React.ReactNode>;
	index: number;
	parent: toast.GroupService;
}

// 2. Design the toast component
function Toast(props: ToastProps) {
	const { actor, index, parent } = props;
	const composedProps = { ...actor, index, parent };

	const service = useMachine(toast.machine, composedProps);
	const api = toast.connect(service, normalizeProps);

	return (
		<Alert
			onClose={api.dismiss}
			severity={api.type !== "loading" ? (api.type as "success") : "info"}
			sx={{ width: "100%" }}
		>
			{api.title ? <AlertTitle>{api.title}</AlertTitle> : null}
			{api.description}
		</Alert>
	);
}

// 3. Design the toaster
export function Toaster() {
	const service = useMachine(toast.group.machine, {
		id: useId(),
		store: toaster,
	});
	const api = toast.group.connect(service, normalizeProps);
	return (
		<div {...api.getGroupProps()}>
			{api.getToasts().map((toast, index) => (
				<Toast key={toast.id} actor={toast} parent={service} index={index} />
			))}
		</div>
	);
}

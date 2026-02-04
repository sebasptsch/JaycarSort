import { ArrowBack } from "@mui/icons-material";
import { IconButton } from "@mui/material";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { useCanGoBack, useRouter } from "@tanstack/react-router";
import { useCallback } from "react";
import { LinkButton } from "./LinkButton";
import ModeSwitchButton from "./ModeSwitchButton";

export default function TopBar() {
	return (
		<AppBar position="static">
			<Toolbar>
				<BackButton />
				<Typography variant="h6" component="div" className="grow">
					Jaycar Stock Locator
				</Typography>
				<LinkButton variant="text" to="/manage" color="inherit">
					Manage
				</LinkButton>
				<ModeSwitchButton />
			</Toolbar>
		</AppBar>
	);
}

function BackButton() {
	const canGoBack = useCanGoBack();
	const router = useRouter();

	const handler = useCallback(() => {
		router.history.back();
	}, [router.history.back]);

	if (canGoBack) {
		return (
			<IconButton onClick={handler} aria-label="Back">
				<ArrowBack />
			</IconButton>
		);
	}

	return null;
}

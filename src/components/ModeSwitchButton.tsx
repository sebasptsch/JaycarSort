import { DarkMode, LightMode, SettingsBrightness } from "@mui/icons-material";
import { IconButton } from "@mui/material";
import { useColorScheme } from "@mui/material/styles";
import { useCallback, useMemo } from "react";

const modes = ["light", "dark", "system"] as const;

export default function ModeSwitchButton() {
	const { mode, setMode } = useColorScheme();

	const modeIcon = useMemo(() => {
		if (mode === "light") {
			return <LightMode />;
		}

		if (mode === "dark") {
			return <DarkMode />;
		}

		return <SettingsBrightness />;
	}, [mode]);

	const handleModeChange = useCallback(() => {
		if (!mode) {
			return;
		}

		const nextMode = modes[(modes.indexOf(mode) + 1) % modes.length];
		setMode(nextMode);
	}, [mode, setMode]);

	if (!mode) {
		return <></>;
	}

	return (
		<IconButton onClick={handleModeChange} color="inherit">
			{modeIcon}
		</IconButton>
	);
}

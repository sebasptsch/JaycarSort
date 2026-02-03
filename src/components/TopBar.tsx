import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { LinkButton } from "./LinkButton";
import ModeSwitchButton from "./ModeSwitchButton";

export default function TopBar() {
	return (
		<AppBar position="static">
			<Toolbar>
				<Typography variant="h6" component="div" className="grow">
					Jaycar Stock Locator
				</Typography>
				<LinkButton variant="text" to="/load" color="inherit">
					Load Data
				</LinkButton>
				<ModeSwitchButton />
			</Toolbar>
		</AppBar>
	);
}

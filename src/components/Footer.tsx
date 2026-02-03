import { Paper, Typography } from "@mui/material";

export default function Footer() {
	return (
		<Paper className="text-center align-middle min-h-10">
			<Typography>
				Jaycar Sort by <a href="https://sebasptsch.dev">Sebastian Pietschner</a>
				. The source code is licensed under{" "}
				<a href="https://choosealicense.com/licenses/mit/">MIT</a>.
				Documentation and new releases can be found on{" "}
				<a href="https://github.com/sebasptsch/jaycarsort">Github</a>.
			</Typography>
		</Paper>
	);
}

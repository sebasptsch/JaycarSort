import { Button, type ButtonProps } from "@mui/material";
import { createLink, type LinkComponent } from "@tanstack/react-router";
import * as React from "react";

interface MUILinkProps extends Omit<ButtonProps, "href"> {
	// Add any additional props you want to pass to the button
}

const MUILinkComponent = React.forwardRef<HTMLAnchorElement, MUILinkProps>(
	(props, ref) => {
		return <Button component={"a"} ref={ref} {...props} />;
	},
);

const CreatedLinkComponent = createLink(MUILinkComponent);

export const LinkButton: LinkComponent<typeof MUILinkComponent> = (props) => {
	return <CreatedLinkComponent preload={"intent"} {...props} />;
};

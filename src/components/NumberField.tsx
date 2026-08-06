import { NumberField as BaseNumberField } from "@base-ui/react/number-field";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import FormControl from "@mui/material/FormControl";
import FormHelperText from "@mui/material/FormHelperText";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import InputLabel from "@mui/material/InputLabel";
import OutlinedInput from "@mui/material/OutlinedInput";
import * as React from "react";

/**
 * This component is a placeholder for FormControl to correctly set the shrink label state on SSR.
 */
function SSRInitialFilled(_: BaseNumberField.Root.Props) {
	return null;
}
SSRInitialFilled.muiName = "Input";

export type NumberFieldProps = BaseNumberField.Root.Props &
	Omit<BaseNumberField.Input.Props, "size"> & {
		label?: React.ReactNode;
		size?: "small" | "medium";
		error?: boolean;
		helperText?: string;
	};

export const transform = {
	input: (value: number) =>
		Number.isNaN(value) || value === 0 ? "" : value.toString(),
	output: (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement, Element>,
	) => {
		const output = parseInt(e.target.value, 10);
		return Number.isNaN(output) ? 0 : output;
	},
};

export default function NumberField({
	id: idProp,
	label,
	error,
	size = "medium",
	...other
}: NumberFieldProps) {
	let id = React.useId();
	if (idProp) {
		id = idProp;
	}
	return (
		<BaseNumberField.Root
			{...other}
			render={(props, state) => (
				<FormControl
					size={size}
					ref={props.ref}
					disabled={state.disabled}
					required={state.required}
					error={error}
					variant="outlined"
				>
					{props.children}
				</FormControl>
			)}
		>
			<SSRInitialFilled {...other} />
			<InputLabel htmlFor={id}>{label}</InputLabel>
			<BaseNumberField.Input
				id={id}
				render={(props, state) => (
					<OutlinedInput
						aria-describedby={`${id}-helper-text`}
						label={label}
						inputRef={props.ref}
						value={state.inputValue}
						onBlur={props.onBlur}
						onChange={props.onChange}
						onKeyUp={props.onKeyUp}
						onKeyDown={props.onKeyDown}
						onFocus={props.onFocus}
						slotProps={{
							input: props,
						}}
						endAdornment={
							<InputAdornment
								position="end"
								sx={{
									flexDirection: "column",
									maxHeight: "unset",
									alignSelf: "stretch",
									borderLeft: "1px solid",
									borderColor: "divider",
									ml: 0,
									"& button": {
										py: 0,
										flex: 1,
										borderRadius: 0.5,
									},
								}}
							>
								<BaseNumberField.Increment
									render={<IconButton size={size} aria-label="Increase" />}
								>
									<KeyboardArrowUpIcon
										fontSize={size}
										sx={{ transform: "translateY(2px)" }}
									/>
								</BaseNumberField.Increment>

								<BaseNumberField.Decrement
									render={<IconButton size={size} aria-label="Decrease" />}
								>
									<KeyboardArrowDownIcon
										fontSize={size}
										sx={{ transform: "translateY(-2px)" }}
									/>
								</BaseNumberField.Decrement>
							</InputAdornment>
						}
						sx={{ pr: 0 }}
					/>
				)}
			/>
			{other.helperText ? (
				<FormHelperText
					id={`${id}-helper-text`}
					sx={{ ml: 0, "&:empty": { mt: 0 } }}
				>
					{other.helperText}
				</FormHelperText>
			) : null}
		</BaseNumberField.Root>
	);
}

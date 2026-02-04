import { TextField, type TextFieldProps } from "@mui/material";
import {
	type FieldPath,
	type FieldValues,
	type UseControllerProps,
	useController,
} from "react-hook-form";

type ControlledTextFieldProps<
	TFieldValues extends FieldValues = FieldValues,
	TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = Omit<
	TextFieldProps,
	"onChange" | "value" | "defaultValue" | "onBlur" | "error"
> &
	UseControllerProps<TFieldValues, TName> & {
		valueAsNumber?: boolean;
	};

export default function ControlledTextField<
	TFieldValues extends FieldValues = FieldValues,
	TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(props: ControlledTextFieldProps<TFieldValues, TName>) {
	const {
		control,
		name,
		rules,
		defaultValue,
		disabled,
		shouldUnregister,
		helperText,
		valueAsNumber = false,
		...rest
	} = props;

	const { field, fieldState } = useController({
		control,
		name,
		defaultValue,
		rules,
		disabled,
		shouldUnregister,
	});

	return (
		<TextField
			{...rest}
			{...field}
			error={!!fieldState.error}
			helperText={fieldState.error ? fieldState.error.message : helperText}
			disabled={disabled}
			onChange={(e) =>
				valueAsNumber
					? field.onChange(parseInt(e.target.value, 10))
					: field.onChange(e.target.value)
			}
			slotProps={{
				input: {
					type: valueAsNumber ? "number" : undefined,
				},
				inputLabel: {
					shrink: true,
				},
			}}
			value={valueAsNumber ? field.value.toString() : field.value}
		/>
	);
}

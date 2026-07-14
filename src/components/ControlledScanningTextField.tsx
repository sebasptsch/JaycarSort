import { TextField, type TextFieldProps } from "@mui/material";
import {
	type FieldPath,
	type FieldValues,
	type UseControllerProps,
	useController,
} from "react-hook-form";
import ScanAdornment from "./ScanAdornment";

type ScanningControlledTextFieldProps<
	TFieldValues extends FieldValues = FieldValues,
	TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = Omit<
	TextFieldProps,
	"onChange" | "value" | "defaultValue" | "onBlur" | "error"
> &
	UseControllerProps<TFieldValues, TName> & {
		valueAsNumber?: boolean;
	};

export default function ScanningControlledTextField<
	TFieldValues extends FieldValues = FieldValues,
	TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(props: ScanningControlledTextFieldProps<TFieldValues, TName>) {
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
				...rest.slotProps,
				input: {
					...rest.slotProps?.input,
					type: valueAsNumber ? "number" : undefined,
					endAdornment: <ScanAdornment setSearch={(v) => field.onChange(v)} />,
				},
				inputLabel: {
					...rest.slotProps?.inputLabel,
					shrink: true,
				},
			}}
			value={valueAsNumber ? field.value.toString() : field.value}
		/>
	);
}

import {
	type FieldPath,
	type FieldValues,
	type UseControllerProps,
	useController,
} from "react-hook-form";
import type { NumberFieldProps } from "./NumberField";
import NumberField from "./NumberField";

type ControlledNumberFieldProps<
	TFieldValues extends FieldValues = FieldValues,
	TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = Omit<
	NumberFieldProps,
	"onChange" | "value" | "defaultValue" | "onBlur" | "error"
> &
	UseControllerProps<TFieldValues, TName>;

export default function ControlledNumberField<
	TFieldValues extends FieldValues = FieldValues,
	TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(props: ControlledNumberFieldProps<TFieldValues, TName>) {
	const {
		name,
		control,
		defaultValue,
		rules,
		disabled,
		shouldUnregister,
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
		<NumberField
			{...rest}
			{...field}
			error={!!fieldState.error}
			helperText={
				fieldState.error ? fieldState.error.message : props.helperText
			}
			disabled={disabled}
		/>
	);
}

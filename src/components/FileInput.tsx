import { Controller } from "react-hook-form";
export const ControllerPlus = ({
  control,
  transform,
  name,
  defaultValue,
}: {
  control: any;
  transform: any;
  defaultValue: any;
  name: any;
}) => (
  <Controller
    defaultValue={defaultValue}
    control={control}
    name={name}
    render={({ field }) => (
      <input
        onChange={(e) => field.onChange(transform.output(e))}
        value={transform.input(field.value)}
      />
    )}
  />
);

// usage below:
<ControllerPlus
  transform={{
    input: (value: any) => {
      var reader = new FileReader();
      console.log(value);
      reader.readAsArrayBuffer(value.files);
      return (reader.onload = () => {
        if (typeof reader.result === "string") return;
        if (!reader.result) return;
        var data = new Uint8Array(reader.result);
        var workbook = XLSX.read(data, { type: "array" });
        return workbook;
      });
    },
    output: (e: any) => {
      const output = parseInt(e.target.value, 10);
      return isNaN(output) ? 0 : output;
    },
  }}
  control={control}
  name="number"
  defaultValue=""
/>;

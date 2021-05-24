import { useForm } from "react-hook-form";
import { useIndexedDB } from "react-indexed-db";
import XLSX from "xlsx";
import { dbitem } from "../lib/interfaces";

export default function UploadFile() {
  const db = useIndexedDB("components");
  const { register, handleSubmit, watch, formState } = useForm();
  const onSubmit = async (data: any) => await handleFileSubmit(data.file[0]);

  const newDBData = async (data: Array<dbitem>) => {
    db.clear();
    return await Promise.all(
      data.map(
        async (component) =>
          await db
            .add(component)
            .catch((err) => console.log(err, component.item))
      )
    );
  };

  const handleFileSubmit = async (file: File) => {
    // console.log(e.target.files[0])
    var reader = new FileReader();
    reader.readAsArrayBuffer(file);
    return (reader.onload = () => {
      if (typeof reader.result === "string") return;
      if (!reader.result) return;
      var data = new Uint8Array(reader.result);
      var workbook = XLSX.read(data, { type: "array" });
      var sheet = workbook.Sheets[workbook.SheetNames[0]];
      var jsonsheet = XLSX.utils.sheet_to_json(sheet);
      console.log(jsonsheet);
      return newDBData(
        jsonsheet.map((component) => {
          const {
            Location,
            Unit,
            Shelf,
            Tray,
            Barcode,
            Description,
            Item,
          }: any = component;
          return {
            location: Location,
            barcode: Barcode,
            description: Description,
            unit: Unit,
            shelf: Shelf,
            tray: Tray,
            item: Item,
          };
        })
      );
    });
  };

  const fileDetails = watch("file");
  console.log();
  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="file has-name">
          <label className="file-label">
            <input
              className="file-input"
              type="file"
              accept=".xlsx"
              {...register("file")}
            />
            <span className="file-cta">
              <span className="file-icon">
                <i className="fas fa-upload"></i>
              </span>
              <span className="file-label">Choose a file…</span>
            </span>
            <span className="file-name">
              {fileDetails ? fileDetails[0]?.name : "No File Chosen"}
            </span>
          </label>
        </div>
        <input type="submit" className="button" />
      </form>
    </>
  );
}

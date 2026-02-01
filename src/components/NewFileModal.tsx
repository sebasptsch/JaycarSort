import { useState } from "react";
import { FaUpload } from "react-icons/fa";
import type { WorkBook } from "xlsx";
import type { Columns, DBItem } from "../lib/interfaces";
import { clearIndex, createIndex } from "../lib/lunr";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const uploadSchema = z.object({
	filelist: z.instanceof(FileList),
});

export default function NewFileModal() {
	const [modalActive, setModalActive] = useState(false); // Define the state of the modal so that it can be activated and dismissed by the user.
	const { handleSubmit, register, formState: { errors } } = useForm({
		resolver: zodResolver(uploadSchema),
	});

	/**
	 * Handles the user submitting the form and moves data from react's state variables to the database.
	 * @param e Submit Event (not used except to prevent page reload on submit).
	 * @returns a promise that is resolved once all excel document data has been moved from state to the database.
	 */
	const onSubmit = handleSubmit(async ({ filelist }) => {
		const { read, utils } = await import("xlsx");
    const file = filelist.item(0)

    if (!file) throw new Error("Not enough files")

    const text = await file?.arrayBuffer()

		var workbook = read(text, { type: "buffer" });
		var sheet = workbook.Sheets[workbook.SheetNames[0]];
		var jsonsheet = utils.sheet_to_json(sheet);

		const data = jsonsheet
			.map((component): DBItem => {
				const row = component as Columns;
				return {
					location: row.Location,
					barcode: row.Barcode,
					description: row.Description ?? "",
					unit: row.Unit,
					shelf: row.Shelf,
					tray: row.Tray,
					item: row.Item,
				};
			})
			.filter((c) => !!c.item && !!c.barcode);

		await clearIndex();
		console.log("Cleared Index");
		await createIndex(data);
		console.log("Created new index");
    setModalActive(false)
	});

	return (
		<>
			<button className="button is-link" onClick={() => setModalActive(true)}>
				New Data
			</button>
			<div
				className={`modal ${modalActive ? "is-active" : ""}`}
				style={{ color: "initial" }}
			>
				<div className="modal-background"></div>
				<div className="modal-card">
					<form onSubmit={onSubmit}>
						<header className="modal-card-head">
							<p className="modal-card-title">Upload New Data</p>
							<button
								className="delete"
								aria-label="close"
								onClick={() => setModalActive(false)}
							></button>
						</header>
						<section className="modal-card-body">
							<div className="file">
								<label className="file-label">
									<input
										className="file-input"
										type="file"
										accept=".xlsx"
										{...register("filelist")}
									/>
									<span className="file-cta">
										<span className="file-icon">
											<i className="fas fa-upload"></i>
											<FaUpload />
										</span>
										<span className="file-label"> Choose a file… </span>
									</span>
								</label>
							</div>

							<br />
              <p>{errors.filelist?.message}</p>
              
						</section>

						<footer className="modal-card-foot">
							<input type="submit" className="button is-info" />
							<button className="button" onClick={() => setModalActive(false)}>
								Cancel
							</button>
						</footer>
					</form>
				</div>

				<button
					className="modal-close is-large"
					aria-label="close"
					onClick={() => {
						setModalActive(false);
					}}
				></button>
			</div>
		</>
	);
}

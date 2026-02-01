import { useState } from 'react';
import { FaUpload } from 'react-icons/fa';
import type { WorkBook } from 'xlsx';
import type { Columns, DBItem } from '../lib/interfaces';
import { clearIndex, createIndex } from '../lib/lunr';

export default function NewFileModal() {

  const [modalActive, setModalActive] = useState(false); // Define the state of the modal so that it can be activated and dismissed by the user.
  const [excelDoc, setExcelDoc] = useState<WorkBook | false>(false); // Store the loaded excel document so that's properties can be used for UI purposes.
  const [filename, setFilename] = useState(''); // For the upload button to show a file name.
  const [progress, setProgress] = useState<any>(0); // For the progress bar state to update the UI.
  /**
   * A function that is called whenever a new excel file is added to the form that handles reading it and storing it's contents in state.
   * @param e File upload button change event (for when a new file is uploaded)
   * @returns Nothing
   */
  const handleChange = async (e: any) => {
    if (!e?.target?.files) return;
    const { read } = await import('xlsx');
    setFilename(e.target.files[0].name);
    var reader = new FileReader();
    reader.readAsArrayBuffer(e.target.files[0]);
    return (reader.onload = () => {
      if (typeof reader.result === 'string') return;
      if (!reader.result) return;
      var data = new Uint8Array(reader.result);
      var workbook = read(data, { type: 'array' });
      setExcelDoc(workbook);
      return;
    });
  };

  /**
   * Handles the user submitting the form and moves data from react's state variables to the database.
   * @param e Submit Event (not used except to prevent page reload on submit).
   * @returns a promise that is resolved once all excel document data has been moved from state to the database.
   */
  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (!excelDoc) return; // Don't do anything if there's no uploaded file.

    /**
     * If the progress isn't undefined skip and display warning as this means that the form has already been submitted.
     */
    if (progress) {
      alert('Wait until the current operation is finished');
      return;
    }

    var workbook = excelDoc;
    var sheet = workbook.Sheets[workbook.SheetNames[0]];
    const { utils } = await import('xlsx');
    var jsonsheet = utils.sheet_to_json(sheet);

    const data = jsonsheet.map((component): DBItem => {
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
      }).filter((c) => !!c.item && !!c.barcode)

   await clearIndex()
   console.log("Cleared Index")
  await createIndex(data)
  console.log("Created new index")
  
    }


  return (
    <>
      <button className="button is-link" onClick={() => setModalActive(true)}>
        New Data
      </button>
      <div
        className={`modal ${modalActive ? 'is-active' : ''}`}
        style={{ color: 'initial' }}
      >
        <div className="modal-background"></div>
        <div className="modal-card">
          <form onSubmit={handleSubmit}>
            <header className="modal-card-head">
              <p className="modal-card-title">Upload New Data</p>
              <button
                className="delete"
                aria-label="close"
                onClick={() => setModalActive(false)}
              ></button>
            </header>
            <section className="modal-card-body">
              <div className="file has-name">
                <label className="file-label">
                  <input
                    className="file-input"
                    type="file"
                    accept=".xlsx"
                    onChange={handleChange}
                  />
                  <span className="file-cta">
                    <span className="file-icon">
                      <i className="fas fa-upload"></i>
                      <FaUpload />
                    </span>
                    <span className="file-label">Choose a file…</span>
                  </span>
                  <span className="file-name">{filename}</span>
                </label>
              </div>
              <br />
              {excelDoc ? (
                <div>
                  <h4 className="is-subtitle is-size-4">Details</h4>
                  <p>
                    <b>Last Author:</b>{' '}
                    {excelDoc ? excelDoc.Props?.LastAuthor : 'unknown'}
                    <br />
                    <b>Last Modified:</b>{' '}
                    {excelDoc?.Props?.ModifiedDate
                      ? new Date(
                          excelDoc.Props?.ModifiedDate,
                        ).toLocaleDateString()
                      : 'unknown'}
                  </p>
                  <br />
                  {progress ? (
                    <progress className="progress is-link" value={progress}>
                      {progress}
                    </progress>
                  ) : null}
                  {progress ? `${Math.round(progress * 100)}%` : null}
                </div>
              ) : null}
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

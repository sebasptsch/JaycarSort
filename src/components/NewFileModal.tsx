import { useIndexedDB } from '@slnsw/react-indexed-db';
import { useState } from 'react';
import { FaUpload } from 'react-icons/fa';
import type { WorkBook } from 'xlsx';
import type { dbitem } from '../lib/interfaces';

export default function NewFileModal() {
  /**
   * Database of all the imported components stored in the clientside.
   */
  const db = useIndexedDB('components');

  const [modalActive, setModalActive] = useState(false); // Define the state of the modal so that it can be activated and dismissed by the user.
  const [excelDoc, setExcelDoc] = useState<WorkBook | false>(false); // Store the loaded excel document so that's properties can be used for UI purposes.
  const [filename, setFilename] = useState(''); // For the upload button to show a file name.
  const [progress, setProgress] = useState<any>(0); // For the progress bar state to update the UI.

  /**
   * A function that adds a list of components into the components database stored in the browser.
   * @param data an array of component items read from the excel file.
   * @returns a promise that is resolved once all items have been added to the db.
   */
  const newDBData = (data: Array<dbitem>) => {
    db.clear(); // Clear all exsisting entries in the database to avoid duplicates.
    return Promise.all(
      data.map(
        async (component, index) =>
          await db
            .add(component)
            .then((res) => {
              setProgress(index / (data.length + 1));
            })
            .catch((err) => console.log(err, component.item)),
      ),
    );
  };

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
    newDBData(
      // Map excel columns to corresponding database field names.
      jsonsheet.map((component) => {
        const { Location, Unit, Shelf, Tray, Barcode, Description, Item }: any =
          component;
        return {
          location: Location,
          barcode: Barcode,
          description: Description,
          unit: Unit,
          shelf: Shelf,
          tray: Tray,
          item: Item,
        };
      }),
    ).then((res) => {
      window.location.reload(); // Reload the page to include new data and indicate success.
      return;
    });
  };

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

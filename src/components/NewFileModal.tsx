import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import ReactIndexedDB from 'react-indexed-db';
import XLSX from 'xlsx';
import { dbitem } from '../lib/interfaces';

export default function NewFileModal() {
  const db = ReactIndexedDB.useIndexedDB('components');

  const [modalActive, setModalActive] = React.useState(false);
  const [excelDoc, setExcelDoc] = React.useState<XLSX.WorkBook>();
  const [filename, setFilename] = React.useState('');
  const [progress, setProgress] = React.useState<any>(0);

  const newDBData = (data: Array<dbitem>) => {
    db.clear();
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

  const handleChange = (e: any) => {
    if (!e?.target?.files) return;
    setFilename(e.target.files[0].name);
    var reader = new FileReader();
    reader.readAsArrayBuffer(e.target.files[0]);
    return (reader.onload = () => {
      if (typeof reader.result === 'string') return;
      if (!reader.result) return;
      var data = new Uint8Array(reader.result);
      var workbook = XLSX.read(data, { type: 'array' });
      setExcelDoc(workbook);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Handle Filter Logic
    if (!excelDoc) return;
    if (progress) {
      alert('Wait until the current operation is finished');
      return;
    }

    var workbook = excelDoc;
    var sheet = workbook.Sheets[workbook.SheetNames[0]];
    var jsonsheet = XLSX.utils.sheet_to_json(sheet);
    newDBData(
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
      window.location.reload();
      return;
    });
  };

  return (
    <>
      <button className="button is-link" onClick={() => setModalActive(true)}>
        New Data
      </button>
      <div className={`modal ${modalActive ? 'is-active' : ''}`}>
        <div className="modal-background"></div>
        <div className="modal-card">
          <form onSubmit={handleSubmit}>
            <header className="modal-card-head">
              <p className="modal-card-title">Upload New Data</p>
              <button className="delete" aria-label="close"></button>
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
                      <FontAwesomeIcon icon={['fas', 'upload']} />
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

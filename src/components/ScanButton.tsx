import React, { useState } from 'react';
import BarcodeScannerComponent from 'react-webcam-barcode-scanner';
export default function ScanButton({
  inputref,
}: {
  inputref: React.MutableRefObject<HTMLInputElement>;
}) {
  const [modalActive, setModalActive] = useState(false);

  return (
    <>
      <button className="button is-link" onClick={() => setModalActive(true)}>
        Scan
      </button>
      {modalActive ? (
        <div
          className={`modal ${modalActive ? 'is-active' : ''}`}
          style={{ color: 'initial' }}
        >
          <div className="modal-background"></div>
          <div className="modal-card">
            <header className="modal-card-head">
              <p className="modal-card-title">Upload New Data</p>
              <button
                className="delete"
                aria-label="close"
                onClick={() => setModalActive(false)}
              ></button>
            </header>
            <section className="modal-card-body">
              <BarcodeScannerComponent
                width={500}
                height={500}
                onUpdate={(err, result) => {
                  if (result) {
                    console.log(result.getText());
                    inputref.current.value = result.getText();
                    setModalActive(false);
                  } else return;
                }}
              />
            </section>

            <footer className="modal-card-foot">
              <button className="button" onClick={() => setModalActive(false)}>
                Cancel
              </button>
            </footer>
          </div>

          <button
            className="modal-close is-large"
            aria-label="close"
            onClick={() => {
              setModalActive(false);
            }}
          ></button>
        </div>
      ) : null}
    </>
  );
}

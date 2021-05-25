import React from 'react';
// import jclogo from './jclogo.svg';
import NewFileModal from './NewFileModal';
export default function Nav() {
  return (
    <div className="is-flex is-flex-align-center m-4">
      <img
        src="/dist/jclogo.svg"
        alt="Jaycar Logo"
        className="box p-0 m-0 mr-2"
        style={{ maxHeight: '80px' }}
      />
      <h3 className="is-3 title mb-0">Stock Locator</h3>
      <span style={{ flex: 1, justifySelf: 'stretch', alignSelf: 'stretch' }} />
      {/* <div>Date</div> */}
      <div className="buttons">
        <NewFileModal />
      </div>
    </div>
  );
}

import { faExpand } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Fuse from 'fuse.js';
import { debounce } from 'lodash';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import ReactIndexedDB from 'react-indexed-db';
import ExtendedSearchHints from '../components/ExtendedSearchHints';
import NewFileModal from '../components/NewFileModal';
import ScanButton from '../components/ScanButton';
import StockItem from '../components/StockItem';

export default function Home() {
  const { getAll } = ReactIndexedDB.useIndexedDB('components');
  const [results, setResults] = useState<Array<any>>([]); // An array of returned search results.
  const [fuse, setFuse] = useState<Fuse<any>>(new Fuse([])); // The instance of search stored within state.
  const [navbarActive, setNavbarActive] = useState(false);
  const [searchString, setSearchString] = useState('');
  const inputref = useRef<HTMLInputElement>();

  useEffect(() => {
    // Retreive the contents of the entire database.
    getAll().then((res) => {
      setFuse(
        new Fuse(res, {
          useExtendedSearch: true, // Allows for different annotation within the search query for more logical searches.
          keys: ['item', 'description', 'barcode'], // Fields to compare and filter.
          threshold: 0, // Certainty threshold.
        }),
      );
    }); // eslint-disable-next-line
  }, []);

  /**
   * Whenever the search string changes recalculate the search results.
   */
  useMemo(() => {
    if (fuse) {
      setResults(fuse.search(searchString));
      console.log(searchString);
    } // eslint-disable-next-line
  }, [searchString]);

  return (
    <>
      <nav
        className="navbar is-primary"
        role="navigation"
        aria-label="main navigation"
      >
        <div className="container">
          <div className="navbar-brand">
            <a className="navbar-item" href="/">
              <img
                src="./dist/jclarge.png"
                height="28"
                width="86"
                alt="Jaycar Logo"
              />
            </a>
            <h4 className="navbar-item is-size-4">Stock Locator</h4>

            <a
              role="button"
              className={`navbar-burger ${navbarActive ? 'is-active' : ''}`}
              aria-label="menu"
              aria-expanded="false"
              data-target="navbarBasicExample"
              onClick={() => {
                setNavbarActive((prev) => !prev);
              }}
            >
              <span aria-hidden="true"></span>
              <span aria-hidden="true"></span>
              <span aria-hidden="true"></span>
            </a>
          </div>

          <div className={`navbar-menu ${navbarActive ? 'is-active' : ''}`}>
            <div className="navbar-end">
              <div className="navbar-item">
                <div className="buttons">
                  <NewFileModal />
                  <ScanButton inputref={inputref} />
                  <button
                    className="button"
                    onClick={() => {
                      // Check to see if the site is in full-screen mode and toggle
                      !document.fullscreenElement
                        ? document.documentElement.requestFullscreen()
                        : document.exitFullscreen();
                    }}
                  >
                    <FontAwesomeIcon icon={faExpand} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>
      <div className="container">
        <div className="p-2">
          <input
            type="text"
            className="input"
            ref={inputref}
            placeholder="Enter Barcode, Catalog Number or Description Keywords"
            onChange={debounce((e) => setSearchString(e.target.value), 500)}
          />
          <div className="m-4">
            {results?.map((item) => (
              <StockItem resultitem={item} key={item.refIndex} />
            ))}
            {results.length === 0 && searchString.length === 0 ? (
              <ExtendedSearchHints />
            ) : results.length === 0 ? (
              <h4 className="is-text-4 has-text-centered m-4">
                <b>No Results</b>
              </h4>
            ) : null}
          </div>
        </div>
      </div>
      <footer className="footer">
        <div className="content has-text-centered">
          <p>
            <strong>Jaycar Sort</strong> by{' '}
            <a href="https://sebasptsch.dev">Sebastian Pietschner</a>. The
            source code is licensed under{' '}
            <a href="https://choosealicense.com/licenses/mit/">MIT</a>.
            Documentation and new releases can be found on{' '}
            <a href="https://github.com/sebasptsch/jaycarsort">Github</a>.
          </p>
        </div>
      </footer>
    </>
  );
}

import { useIndexedDB } from '@slnsw/react-indexed-db';
import { useQuery } from '@tanstack/react-query';
import Fuse from 'fuse.js';
import { debounce } from 'lodash';
import { useEffect, useRef, useState } from 'react';
import { FaExpand } from 'react-icons/fa';
import type { dbitem } from 'src/lib/interfaces';
import ExtendedSearchHints from '../components/ExtendedSearchHints';
import NewFileModal from '../components/NewFileModal';
import ScanButton from '../components/ScanButton';
import StockItem from '../components/StockItem';
import jclarge from './jclarge.png';

interface Component {
  id: number;
  location?: string;
  unit?: string;
  shelf?: string;
  tray?: string;
  barcode?: string;
  item?: string;
  description?: string;
  notes?: string;
}

export default function Home() {
  // const { getAll } = ReactIndexedDB.useIndexedDB('components');
  const { getAll } = useIndexedDB('components');
  const [navbarActive, setNavbarActive] = useState(false);
  const [searchString, setSearchString] = useState('');
  const [results, setResults] = useState<dbitem[]>([]);

  const fuseRef = useRef<Fuse<dbitem>>(null);

  const getAllEntries = useQuery({
    queryKey: ['components'],
    queryFn: () => getAll<dbitem>(),
  });

  useEffect(() => {
    if (getAllEntries.isSuccess) {
      fuseRef.current = new Fuse(getAllEntries.data, {
        keys: ['barcode', 'item', 'description'],
        includeScore: true,
        useExtendedSearch: true,
        threshold: 0.3,
      });
    }

    return () => {
      fuseRef.current = null;
    };
  }, [getAllEntries]);

  useEffect(() => {
    if (fuseRef.current) {
      setResults(
        fuseRef.current.search(searchString).map((result) => result.item),
      );
    }
  }, [searchString, fuseRef.current]);

  const debouncedSearch = debounce((v: string) => {
    setSearchString(v);
  }, 500);

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
              <img src={jclarge} height="28" width="86" alt="Jaycar Logo" />
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
                  <ScanButton onChange={debouncedSearch} />
                  <button
                    className="button"
                    onClick={() => {
                      // Check to see if the site is in full-screen mode and toggle
                      !document.fullscreenElement
                        ? document.documentElement.requestFullscreen()
                        : document.exitFullscreen();
                    }}
                  >
                    <FaExpand />
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
            placeholder="Enter Barcode, Catalog Number or Description Keywords"
            onChange={(e) => {
              debouncedSearch(e.target.value);
            }}
          />
          <div className="m-4">
            {results?.map((item) => (
              <StockItem resultitem={item} key={item.item} />
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

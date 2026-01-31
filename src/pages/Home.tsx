import { useIndexedDB } from '@slnsw/react-indexed-db';
import { useQuery } from '@tanstack/react-query';
import Fuse from 'fuse.js';
import { debounce } from 'lodash';
import { useEffect, useState } from 'react';
import { FaExpand } from 'react-icons/fa';
import { Virtuoso } from 'react-virtuoso';
import ExtendedSearchHints from '../components/ExtendedSearchHints';
import NewFileModal from '../components/NewFileModal';
import ScanButton from '../components/ScanButton';
import StockItem from '../components/StockItem';
import jclarge from './jclarge.png';
import type { dbitem } from '../lib/interfaces';

// interface Component {
//   id: number;
//   location?: string;
//   unit?: string;
//   shelf?: string;
//   tray?: string;
//   barcode?: string;
//   item?: string;
//   description?: string;
//   notes?: string;
// }

export default function Home() {
  // const { getAll } = ReactIndexedDB.useIndexedDB('components');
  const { getAll } = useIndexedDB('components');
  const [navbarActive, setNavbarActive] = useState(false);
  const [searchString, setSearchString] = useState('');
  const [results, setResults] = useState<dbitem[]>([]);

  const getAllEntries = useQuery({
    queryKey: ['components'],
    queryFn: () => getAll<dbitem>(),
  });

  useEffect(() => {
    if (!searchString) {
      setResults([]);
    } else {
      const fuse = new Fuse(getAllEntries.data ?? [], {
        keys: ['barcode', 'item', 'description'],
        includeScore: true,
        useExtendedSearch: true,
        threshold: 0.3,
      });
      setResults(fuse.search(searchString).map((result) => result.item));
    }
  }, [searchString, getAllEntries.data]);

  const debouncedSearch = debounce((v: string) => {
    setSearchString(v);
  }, 500);

  return (
    <>
      <nav
        className="navbar is-primary"
        role="navigation"
        aria-label="main navigation"
        style={{ flex: 'none' }}
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
      <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <input
          type="text"
          className="input my-2"
          style={{ flex: 'none', width: '100%' }}
          placeholder="Enter Barcode, Catalog Number or Description Keywords"
          onChange={(e) => {
            debouncedSearch(e.target.value);
          }}
        />
        <Virtuoso
          style={{ flexGrow: 1 }}
          data={results}
          totalCount={results.length}
          itemContent={(_index, item) => (
            <StockItem item={item} key={item.item} />
          )}
          components={{
            EmptyPlaceholder: () => <ExtendedSearchHints />,
          }}
        />

        {/* {results.length === 0 && searchString.length === 0 ? (
              <ExtendedSearchHints />
            ) : results.length === 0 ? (
              <h4 className="is-text-4 has-text-centered m-4">
                <b>No Results</b>
              </h4>
            ) : null} */}
      </div>
      <footer className="footer" style={{ flex: 'none' }}>
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

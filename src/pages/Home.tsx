import Fuse from 'fuse.js';
import { debounce } from 'lodash';
import React from 'preact/compat';
import ReactIndexedDB from 'react-indexed-db';
import ExtendedSearchHints from '../components/ExtendedSearchHints';
import StockItem from '../components/StockItem';

export default function Home({setSearchString, searchString}) {
  const { getAll } = ReactIndexedDB.useIndexedDB('components');
  const [results, setResults] = React.useState<Array<any>>([]); // An array of returned search results.
  const [fuse, setFuse] = React.useState<Fuse<any>>(new Fuse([])); // The instance of search stored within state.

  React.useEffect(() => {
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
  React.useMemo(() => {
    if (fuse) {
      setResults(fuse.search(searchString));
    } // eslint-disable-next-line
  }, [searchString]);

  return (
    <div className="p-2">
      <input
        type="text"
        className="input"
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
  );
}

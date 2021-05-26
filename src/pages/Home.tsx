import Fuse from 'fuse.js';
import { debounce } from 'lodash';
import React from 'preact/compat';
import ReactIndexedDB from 'react-indexed-db';
import StockItem from '../components/StockItem';
import {motion} from 'framer-motion'

export default function Home() {
  const { getAll } = ReactIndexedDB.useIndexedDB('components');
  const [searchString, setSearchString] = React.useState('');
  const [results, setResults] = React.useState<Array<any>>([]);
  const [fuse, setFuse] = React.useState<Fuse<any>>(new Fuse([]));

  React.useEffect(() => {
    getAll().then((res) => {
      setFuse(
        new Fuse(res, {
          useExtendedSearch: true,
          keys: ['item', 'description', 'barcode'],
          threshold: 0,
        }),
      );
    }); // eslint-disable-next-line
  }, []);

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
      <div className="m-4" >
        {results?.map((item) => (
          <StockItem resultitem={item} key={item.refIndex} />
        ))}
        {results.length === 0 ? (
          <h4 className="is-text-4 has-text-centered m-4">
            <b>No Results</b>
          </h4>
        ) : null}
      </div>
    </div>
  );
}

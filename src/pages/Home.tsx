import Fuse from "fuse.js";
import { debounce } from "lodash";
import { useEffect, useState } from "react";
import { useIndexedDB } from "react-indexed-db";
import StockItem from "../components/StockItem";
import { dbitem } from "../interfaces";

export default function Home() {
  const [components, setComponents] = useState<undefined | Array<dbitem>>([]);
  const { getAll } = useIndexedDB("components");
  const [searchString, setSearchString] = useState("");
  const [results, setResults] = useState<Array<any>>([]);
  const [fuse, setFurse] = useState<Fuse<any>>();
  const options = {
    useExtendedSearch: true,
    keys: ["item", "description", "barcode"],
  };

  useEffect(() => {
    getAll().then((res) => {
      setFurse(new Fuse(res, options));
    });
  }, []);

  useEffect(() => {
    if (fuse) {
      setResults(fuse.search(searchString));
    }
  }, [searchString]);

  return (
    <div className="p-2">
      <input
        type="text"
        className="input"
        onChange={debounce((e) => setSearchString(e.target.value), 500)}
      />
      <div className="m-4">
        {results?.map((item) => (
          <StockItem resultitem={item} />
        ))}
        {results ? (
          <h4 className="is-text-4 has-text-centered m-4">
            <b>
              No Results <br /> (Start typing or try different search terms)
            </b>
          </h4>
        ) : null}
      </div>

      {/* <pre>{JSON.stringify(results, undefined, 2)}</pre> */}
    </div>
  );
}

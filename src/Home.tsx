import Fuse from "fuse.js";
import { useEffect, useMemo, useState } from "react";
import { useIndexedDB } from "react-indexed-db";
import StockItem from "./components/StockItem";
import { dbitem } from "./interfaces";

export default function Home() {
  const [components, setComponents] = useState<undefined | Array<dbitem>>([]);
  const { getAll } = useIndexedDB("components");
  const [searchString, setSearchString] = useState("");
  const [results, setResults] = useState<Array<any>>();
  const options = {
    useExtendedSearch: true,
    keys: ["item", "description", "barcode"],
  };

  useEffect(() => {
    getAll().then((itemsFromDB) => {
      setComponents(itemsFromDB);
    });
  }, []);
  useMemo(() => {
    if (components !== undefined) {
      const fuse = new Fuse(components, options);
      setResults(fuse.search(searchString));
    }
  }, [searchString, components]);

  return (
    <>
      <input
        type="text"
        className="input"
        onChange={(e) => setSearchString(e.target.value)}
      />
      {results?.map((item) => (
        <StockItem item={item} />
      ))}
      <pre>{JSON.stringify(results, undefined, 2)}</pre>
    </>
  );
}

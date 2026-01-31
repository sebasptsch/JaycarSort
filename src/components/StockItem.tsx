import type { dbitem } from "../lib/interfaces";


/**
 * A repeatable component used for displaying item details in an understandable format.
 * @returns JSX component filled with data from input.
 */
export default function StockItem({ item }: { item: dbitem }) {
  return (
    <div className="notification is-primary mx-4 my-2">
      <div className="columns is-multiline is-gapless">
        <div className="column is-half">
          <b>Item:</b>
          {item.item}
          <br />
        </div>
        <div className="column is-half">
          <b>Description:</b> {item.description}
        </div>
        <div className="column is-half">
          <b>Barcode:</b> {item.barcode}
        </div>
      </div>
      <div className="columns">
        <div className="column has-text-centered">
          <h4 className="is-subtitle is-size-4">
            {item.location} {item.unit}
          </h4>
        </div>

        <div className="column has-text-centered">
          <h4 className="is-subtitle is-size-4">
            {item.location === 'Capstan' ? 'Column' : 'Shelf'} {item.shelf}
          </h4>
        </div>
        <div className="column has-text-centered">
          <h4 className="is-subtitle is-size-4">
            {item.location === 'Capstan'
              ? 'Row'
              : item.location === 'Zone'
              ? 'Position '
              : 'Tray'}
            {item.tray}
          </h4>
        </div>
      </div>
    </div>
  );
}

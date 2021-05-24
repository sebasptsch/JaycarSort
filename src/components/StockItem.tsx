import { dbitem } from "../interfaces";

export default function StockItem({ item }: { item: dbitem }) {
  return (
    <div className="notification">
      <div className="columns is-half">
        <div className="column ">
          <b>Item:</b> {item.item} <br />
          <b>Description:</b> {item.description}
        </div>
        <div className="column ">
          <b>Barcode:</b> {item.barcode}
        </div>
      </div>
      <div className="columns">
        <div className="column">
          <h4 className="is-subtitle is-size-4">
            <b>Location:</b> {item.location}
          </h4>
        </div>
        <div className="column">
          <h4 className="is-subtitle is-size-4">
            <b>Unit:</b> {item.unit}
          </h4>
        </div>
        <div className="column">
          <h4 className="is-subtitle is-size-4">
            <b>Shelf:</b> {item.shelf}
          </h4>
        </div>
        <div className="column">
          <h4 className="is-subtitle is-size-4">
            <b>Tray:</b> {item.tray}
          </h4>
        </div>
      </div>
    </div>
  );
}

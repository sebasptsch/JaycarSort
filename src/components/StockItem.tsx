import React from 'preact/compat';
import {motion, MotionProps} from 'framer-motion'

export default function StockItem({ resultitem, variants }: { resultitem: any, variants: any }) {
  const { item } = resultitem;
  return (
    <motion.div className="notification is-primary" variants={variants}>
      <div className="columns is-multiline is-gapless">
        <div className="column is-half">
          <b>Item:</b> {item.item} <br />
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
            {item.location === 'Capstan' ? 'Row' : 'Tray'} {item.tray}
          </h4>
        </div>
      </div>
    </motion.div>
  );
}

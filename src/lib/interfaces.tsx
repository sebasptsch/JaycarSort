/**
 * Defines expected types for an item inside the IndexedDB.
 */
export interface dbitem {
  barcode: number;
  description: string;
  item: string;
  location: string;
  shelf: number;
  tray: number;
  unit: number;
}

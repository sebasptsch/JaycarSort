/**
 * Defines expected types for an item inside the IndexedDB.
 */
export interface DBItem {
	barcode: number;
	description: string;
	item: string;
	location: string;
	shelf: number;
	tray: number;
	unit: number;
}

export interface Columns {
	Location: string;
	Unit: number;
	Shelf: number;
	Tray: number;
	Barcode: number;
	Description: string;
	Item: string;
}

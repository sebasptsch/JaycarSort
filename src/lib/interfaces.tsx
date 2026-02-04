import z from "zod";

export const dbItemSchema = z.object({
	barcode: z.number(),
	description: z.string().default(""),
	item: z.string(),
	location: z.enum(["Turbine", "Capstan", "Zone"]),
	shelf: z.number(),
	tray: z.number(),
	unit: z.number(),
});

export type DBItem = z.output<typeof dbItemSchema>;

export interface Columns {
	Location: string;
	Unit: number;
	Shelf: number;
	Tray: number;
	Barcode: number;
	Description: string;
	Item: string;
}

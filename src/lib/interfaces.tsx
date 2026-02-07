import z from "zod";

export const dbItemSchema = z.object({
	barcode: z.string(),
	description: z.string().default(""),
	item: z.string(),
	location: z.enum(["Turbine", "Capstan", "Zone"]),
	shelf: z.number(),
	tray: z.number(),
	unit: z.coerce.string(),
});

export type DBItem = z.output<typeof dbItemSchema>;

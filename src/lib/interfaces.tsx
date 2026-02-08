import z from "zod";

export const dbItemSchema = z.object({
	barcode: z.coerce.string(),
	description: z.string().default(""),
	item: z.string(),
	location: z.enum(["Turbine", "Capstan", "Zone"]),
	shelf: z.coerce.number(),
	tray: z.coerce.number(),
	unit: z.coerce.string(),
});

export type DBItem = z.output<typeof dbItemSchema>;

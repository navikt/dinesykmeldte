import { z } from "zod";
import { DateTimeSchema } from "./common";

export type AktivitetsvarselApi = z.infer<typeof AktivitetsvarselSchema>;
export const AktivitetsvarselSchema = z.object({
  hendelseId: z.string(),
  mottatt: DateTimeSchema,
  lest: DateTimeSchema.nullable(),
});

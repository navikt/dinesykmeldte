import { z } from "zod";

const paaminnelseStatuser = ["SKJULT", "TILBUD", "BESTILT"] as const;

const paaminnelseFeilkoder = [
  "UGYLDIG_FORESPORSEL",
  "IKKE_AUTORISERT",
  "STATUS_FEILET",
  "BESTILLING_FEILET",
  "AVBESTILLING_FEILET",
] as const;

/**
 * The single client-safe status contract. Only the UI state is exposed:
 * SKJULT, TILBUD or BESTILT. Unknown backend fields are stripped so additive
 * upstream changes stay backend-owned, while an unknown status still fails
 * closed to SKJULT in the service.
 */
export type PaaminnelseStatus = z.infer<typeof PaaminnelseStatusSchema>;
export const PaaminnelseStatusSchema = z
  .object({
    status: z.enum(paaminnelseStatuser),
  })
  .strip();

/** POST body must be empty for now; reject any unexpected client input. */
export type BestillPaaminnelseRequest = z.infer<
  typeof BestillPaaminnelseRequestSchema
>;
export const BestillPaaminnelseRequestSchema = z.object({}).strict().optional();

export type PaaminnelseFeilkode = z.infer<typeof PaaminnelseFeilkodeSchema>;
export const PaaminnelseFeilkodeSchema = z.enum(paaminnelseFeilkoder);

export type PaaminnelseFeilResponse = z.infer<
  typeof PaaminnelseFeilResponseSchema
>;
export const PaaminnelseFeilResponseSchema = z
  .object({
    feilkode: PaaminnelseFeilkodeSchema,
  })
  .strict();

/** Server-side identifiers resolved from the caller's narmestelederId. */
export type PaaminnelseIdentifikatorer = {
  orgnummer: string;
  fnr?: string;
};

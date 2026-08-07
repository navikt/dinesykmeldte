import { z } from "zod";

const paaminnelseStatuser = ["SKJULT", "TILGJENGELIG", "BESTILT"] as const;

const paaminnelseFeilkoder = [
  "UGYLDIG_FORESPORSEL",
  "IKKE_AUTORISERT",
  "STATUS_FEILET",
  "BESTILLING_FEILET",
  "AVBESTILLING_FEILET",
] as const;

/**
 * Den klientsikre status-kontrakten. Vi eksponerer bare UI-tilstanden:
 * SKJULT, TILGJENGELIG eller BESTILT. Backend avgjør hvilken av de tre som
 * gjelder (tidsvindu, om det finnes en plan, bestilt eller ikke), og vi viser
 * bare den.
 *
 * Ukjente backend-felt strippes bort, så backend kan legge til nye felt uten
 * at klienten må endres. En ukjent status-verdi gjør at hele parsingen feiler,
 * så servicen faller tilbake til SKJULT.
 */
export type PaaminnelseStatus = z.infer<typeof PaaminnelseStatusSchema>;
export const PaaminnelseStatusSchema = z.object({
  status: z.enum(paaminnelseStatuser),
});

/** POST-body skal være tom foreløpig; avvis uventet input fra klienten. */
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

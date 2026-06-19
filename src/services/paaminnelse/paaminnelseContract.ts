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
 * The single client-safe status contract. Only the UI state is exposed:
 * SKJULT, TILGJENGELIG or BESTILT. The backend computes which of the three
 * applies (time window, existing plan, ordered/not) and we surface just that.
 *
 * `synligFra` is the start date of the active oppfølgingstilfelle (the first
 * sykmelding's fom). It lets the UI show the same per-relasjon reminder on the
 * individual sykmelding pages too: a sykmelding is in scope when its earliest
 * fom is on or after `synligFra`. The upper bound is carried by `status` (it
 * flips to SKJULT once the window closes or a plan exists), so no end date is
 * needed. It is best-effort: a missing or malformed value falls back to null,
 * which only disables the per-sykmelding filtering — the status itself is
 * unaffected and the reminder still shows on the overview.
 *
 * Unknown backend fields are stripped so additive upstream changes stay
 * backend-owned, while an unknown status still fails closed to SKJULT in the
 * service.
 */
export type PaaminnelseStatus = z.infer<typeof PaaminnelseStatusSchema>;
export const PaaminnelseStatusSchema = z
  .object({
    status: z.enum(paaminnelseStatuser),
    synligFra: z.string().date().nullable().catch(null),
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

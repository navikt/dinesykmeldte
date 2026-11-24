import { z } from "zod";
import { TildelingsgruppeSchema } from "../services/tiltakspakke/tiltakspakkevurderingContract";
import { getBrowserObservability } from "./browser";

const eventSchema = z.object({
  variant: z.literal("aid"),
  paaminnelsevalg: z.enum(["bestilt", "ikke_bestilt"]),
  hendelse: z.enum(["bestill", "avbestill"]),
  utfall: z.enum(["forsok", "bekreftet", "feilet", "ikke_bekreftet"]),
});
export type AidPaaminnelseEvent = z.infer<typeof eventSchema>;

const stegoversiktContextSchema = z.object({
  schema_version: z.literal("1"),
  flate: z.literal("stegoversikt"),
  tiltakspakke: z.literal("2"),
  gruppe: TildelingsgruppeSchema,
});
export const STEGOVERSIKT_FANER = [
  "hold_kontakten",
  "oppfolgingsplan",
  "dialogmote_1",
] as const;
export const STEGOVERSIKT_LENKER = [
  "tilrettelegging",
  "samtalestotte",
  "oppfolgingsplan",
  "slik_dialogmote_1",
  "om_dialogmote",
  "videre_oppfolging",
  "kontakt_nav",
] as const;
const stegoversiktFaneSchema = z.enum(STEGOVERSIKT_FANER);
const stegoversiktVisibilityEventSchema = stegoversiktContextSchema.extend({
  hendelse: z.enum(["vist", "skjul", "vis"]),
});
const stegoversiktTabEventSchema = stegoversiktContextSchema.extend({
  hendelse: z.literal("fane_valgt"),
  fane: stegoversiktFaneSchema,
});
const stegoversiktLinkEventSchema = stegoversiktContextSchema.extend({
  hendelse: z.literal("lenke_klikket"),
  fane: stegoversiktFaneSchema.optional(),
  lenke: z.enum(STEGOVERSIKT_LENKER),
});
const stegoversiktEventSchema = z.union([
  stegoversiktVisibilityEventSchema,
  stegoversiktTabEventSchema,
  stegoversiktLinkEventSchema,
]);
export type AidStegoversiktEvent = z.infer<typeof stegoversiktEventSchema>;

/** Only closed product categories leave the app; no IDs, dates or free text. */
export function recordAidPaaminnelse(event: AidPaaminnelseEvent): void {
  const parsed = eventSchema.safeParse(event);
  if (!parsed.success) return;
  try {
    // Reuse the initialized APM instance and its existing beforeSend chain.
    // Faro's default event dedupe would collapse separate actions with
    // identical categories.
    getBrowserObservability()?.api.pushEvent(
      "aid_paaminnelse",
      {
        ...parsed.data,
        flate: "dinesykmeldte",
        schema_version: "1",
      },
      "aid",
      { skipDedupe: true },
    );
  } catch {
    // Telemetry must never interrupt a product action or its success handler.
  }
}

/** Only closed interaction categories leave the app; no IDs or free text. */
export function recordAidStegoversikt(event: AidStegoversiktEvent): void {
  const parsed = stegoversiktEventSchema.safeParse(event);
  if (!parsed.success) return;
  try {
    getBrowserObservability()?.api.pushEvent(
      "aid_stegoversikt",
      parsed.data,
      "aid",
      { skipDedupe: true },
    );
  } catch {
    // Telemetry must never interrupt a product action or its success handler.
  }
}

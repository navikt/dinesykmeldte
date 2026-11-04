import { z } from "zod";
import {
  OPPFOLGINGSPLAN_TILTAKSPAKKE_1,
  TildelingsgruppeSchema,
} from "../services/tiltakspakke/tiltakspakkevurderingContract";
import { getBrowserObservability } from "./browser";

const eventContextSchema = z.object({
  gruppe: TildelingsgruppeSchema,
  variant: z.enum(["aid", "skjult"]),
  paaminnelsevalg: z.enum([
    "bestilt",
    "ikke_bestilt",
    "ikke_tilbudt",
    "ukjent",
  ]),
});
const deliveryEventSchema = eventContextSchema.extend({
  hendelse: z.enum(["beslutning", "vist"]),
  utfall: z.enum([
    "tilgjengelig",
    "skjult",
    "vurdering_mangler",
    "status_feilet",
  ]),
});
const actionEventSchema = eventContextSchema.extend({
  hendelse: z.enum(["bestill", "avbestill"]),
  utfall: z.enum(["forsok", "bekreftet", "feilet", "ikke_bekreftet"]),
});
const eventSchema = z.union([deliveryEventSchema, actionEventSchema]);
export type AidPaaminnelseDeliveryEvent = z.infer<typeof deliveryEventSchema>;
export type AidPaaminnelseActionEvent = z.infer<typeof actionEventSchema>;
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
  "krav_om_aktivitet",
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
    // Faro's default event dedupe would collapse two different visits with
    // identical categories. React owns view dedupe; no tracking ID is needed.
    getBrowserObservability()?.api.pushEvent(
      "aid_paaminnelse",
      {
        ...parsed.data,
        tiltakspakke: OPPFOLGINGSPLAN_TILTAKSPAKKE_1,
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

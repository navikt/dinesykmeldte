import { z } from "zod";
import { OPPFOLGINGSPLAN_TILTAKSPAKKE_1 } from "../services/tiltakspakke/tiltakspakkevurderingContract";
import { getBrowserObservability } from "./browser";

export const aidGruppeSchema = z.enum([
  "tiltak",
  "kontroll",
  "utenfor_scope",
  "blandet",
  "ukjent",
]);
export type AidGruppe = z.infer<typeof aidGruppeSchema>;

const eventSchema = z.object({
  gruppe: aidGruppeSchema,
  variant: z.enum(["aid", "skjult"]),
  hendelse: z.enum(["beslutning", "vist", "bestill", "avbestill"]),
  paaminnelsevalg: z.enum([
    "bestilt",
    "ikke_bestilt",
    "ikke_tilbudt",
    "ukjent",
  ]),
  utfall: z.enum([
    "tilgjengelig",
    "skjult",
    "vurdering_mangler",
    "status_feilet",
    "forsok",
    "bekreftet",
    "feilet",
    "ikke_bekreftet",
  ]),
});
export type AidPaaminnelseEvent = z.infer<typeof eventSchema>;

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

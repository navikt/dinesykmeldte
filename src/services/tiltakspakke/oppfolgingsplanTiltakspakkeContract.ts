import { z } from "zod";

export const OPPFOLGINGSPLAN_TILTAKSPAKKE_1 =
  "OPPFOLGINGSPLAN_TILTAKSPAKKE_1" as const;

export type OppfolgingsplanTiltakspakkeStatus = z.infer<
  typeof OppfolgingsplanTiltakspakkeStatusSchema
>;
export const OppfolgingsplanTiltakspakkeStatusSchema = z.enum([
  "TILTAKSGRUPPE",
  "KONTROLLGRUPPE",
  "UTENFOR_SCOPE",
]);

export type OppfolgingsplanTiltakspakkeToggleId = z.infer<
  typeof OppfolgingsplanTiltakspakkeToggleIdSchema
>;
export const OppfolgingsplanTiltakspakkeToggleIdSchema = z.literal(
  OPPFOLGINGSPLAN_TILTAKSPAKKE_1,
);

export type OppfolgingsplanTiltakspakkeGate = z.infer<
  typeof OppfolgingsplanTiltakspakkeGateSchema
>;
export const OppfolgingsplanTiltakspakkeGateSchema = z
  .object({
    orgnummer: z.string().min(1),
    status: OppfolgingsplanTiltakspakkeStatusSchema,
    toggleId: OppfolgingsplanTiltakspakkeToggleIdSchema,
  })
  .strict();

export type OppfolgingsplanTiltakspakkeGateMap = z.infer<
  typeof OppfolgingsplanTiltakspakkeGateMapSchema
>;
export const OppfolgingsplanTiltakspakkeGateMapSchema = z
  .object({
    gates: z.array(OppfolgingsplanTiltakspakkeGateSchema),
  })
  .strict();

export function createEmptyOppfolgingsplanTiltakspakkeGateMap(): OppfolgingsplanTiltakspakkeGateMap {
  return {
    gates: [],
  };
}

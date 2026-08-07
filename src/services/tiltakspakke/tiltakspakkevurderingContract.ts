import { z } from "zod";

/**
 * Default-deny for konsumenter (#731): UI skal kun åpne gating når den relevante
 * virksomheten eksplisitt har `deltakelse === "TILTAKSGRUPPE"`. Alt annet betyr
 * "ikke vis": fravær av vurderingen, tom topp-array, tom `virksomheter`-array,
 * samt `KONTROLLGRUPPE` og `UTENFOR_SCOPE`. Konsumenter må aldri tolke fravær
 * eller ukjente verdier som "vis".
 */
export const OPPFOLGINGSPLAN_TILTAKSPAKKE_1 =
  "OPPFOLGINGSPLAN_TILTAKSPAKKE_1" as const;

export type TiltakspakkevurderingDeltakelse = z.infer<
  typeof TiltakspakkevurderingDeltakelseSchema
>;
export const TiltakspakkevurderingDeltakelseSchema = z.enum([
  "TILTAKSGRUPPE",
  "KONTROLLGRUPPE",
  "UTENFOR_SCOPE",
]);

export type TiltakspakkevurderingTiltakspakkeId = z.infer<
  typeof TiltakspakkevurderingTiltakspakkeIdSchema
>;
export const TiltakspakkevurderingTiltakspakkeIdSchema = z.literal(
  OPPFOLGINGSPLAN_TILTAKSPAKKE_1,
);

export type TiltakspakkeVirksomhet = z.infer<
  typeof TiltakspakkeVirksomhetSchema
>;
export const TiltakspakkeVirksomhetSchema = z
  .object({
    orgnummer: z.string().min(1),
    deltakelse: TiltakspakkevurderingDeltakelseSchema,
  })
  .strict();

export type Tiltakspakkevurdering = z.infer<typeof TiltakspakkevurderingSchema>;
export const TiltakspakkevurderingSchema = z
  .object({
    tiltakspakkeId: TiltakspakkevurderingTiltakspakkeIdSchema,
    virksomheter: z.array(TiltakspakkeVirksomhetSchema),
  })
  .strict();

export type Tiltakspakkevurderinger = z.infer<
  typeof TiltakspakkevurderingerSchema
>;
export const TiltakspakkevurderingerSchema = z.array(
  TiltakspakkevurderingSchema,
);

export function createEmptyTiltakspakkevurderinger(): Tiltakspakkevurderinger {
  return [];
}

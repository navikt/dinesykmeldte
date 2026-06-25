import { z } from "zod";

export const OPPFOLGINGSPLAN_TILTAKSPAKKE_1 =
  "OPPFOLGINGSPLAN_TILTAKSPAKKE_1" as const;

export type TiltakspakkevurderingStatus = z.infer<
  typeof TiltakspakkevurderingStatusSchema
>;
export const TiltakspakkevurderingStatusSchema = z.enum([
  "TILTAKSGRUPPE",
  "KONTROLLGRUPPE",
  "UTENFOR_SCOPE",
]);

export type TiltakspakkevurderingToggleId = z.infer<
  typeof TiltakspakkevurderingToggleIdSchema
>;
export const TiltakspakkevurderingToggleIdSchema = z.literal(
  OPPFOLGINGSPLAN_TILTAKSPAKKE_1,
);

export type Tiltakspakkevurdering = z.infer<typeof TiltakspakkevurderingSchema>;
export const TiltakspakkevurderingSchema = z
  .object({
    orgnummer: z.string().min(1),
    status: TiltakspakkevurderingStatusSchema,
    toggleId: TiltakspakkevurderingToggleIdSchema,
  })
  .strict();

export type TiltakspakkevurderingMap = z.infer<
  typeof TiltakspakkevurderingMapSchema
>;
export const TiltakspakkevurderingMapSchema = z
  .object({
    vurderinger: z.array(TiltakspakkevurderingSchema),
  })
  .strict();

export function createEmptyTiltakspakkevurderingMap(): TiltakspakkevurderingMap {
  return {
    vurderinger: [],
  };
}

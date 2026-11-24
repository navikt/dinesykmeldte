import { z } from "zod";

/** Assignment for the selected organisation context, not feature visibility. */
export const TildelingsgruppeSchema = z.enum([
  "tiltak",
  "kontroll",
  "utenfor_scope",
  "blandet",
  "ukjent",
]);
export type Tildelingsgruppe = z.infer<typeof TildelingsgruppeSchema>;

export const DIALOGMOTE_TILTAKSPAKKE_2 = "DIALOGMOTE_TILTAKSPAKKE_2" as const;

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
export const TiltakspakkevurderingTiltakspakkeIdSchema = z.enum([
  DIALOGMOTE_TILTAKSPAKKE_2,
]);

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

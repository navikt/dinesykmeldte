import { z } from "zod";

export type FlaggskipetVirksomhet = z.infer<typeof FlaggskipetVirksomhetSchema>;
export const FlaggskipetVirksomhetSchema = z.object({
  orgnummer: z.string().nullish(),
  deltakelse: z.string().nullish(),
});

export type FlaggskipetTiltakspakkevurdering = z.infer<
  typeof FlaggskipetTiltakspakkevurderingSchema
>;
export const FlaggskipetTiltakspakkevurderingSchema = z.object({
  tiltakspakkeId: z.string().nullish(),
  virksomheter: z.array(FlaggskipetVirksomhetSchema.nullish()).nullish(),
});

export type FlaggskipetTiltakspakkevurderinger = z.infer<
  typeof FlaggskipetTiltakspakkevurderingerSchema
>;
export const FlaggskipetTiltakspakkevurderingerSchema = z.array(
  FlaggskipetTiltakspakkevurderingSchema,
);

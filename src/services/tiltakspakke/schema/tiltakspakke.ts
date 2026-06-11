import { z } from "zod";

export const TILTAKSPAKKE_ID = "TILTAKSPAKKE_1";

const tiltakspakkeVurderingStatuses = [
  "DELTAR_I_TILTAKSGRUPPE",
  "DELTAR_I_KONTROLLGRUPPE",
  "IKKE_I_MAALGRUPPE",
  "IKKE_AKTIV",
] as const;

export type TiltakspakkeVurderingStatus = z.infer<
  typeof TiltakspakkeVurderingStatusSchema
>;
export const TiltakspakkeVurderingStatusSchema = z.enum(
  tiltakspakkeVurderingStatuses,
);

export type TiltakspakkeVurderingResponse = z.infer<
  typeof TiltakspakkeVurderingResponseSchema
>;
export const TiltakspakkeVurderingResponseSchema = z
  .object({
    tiltakspakke: z.literal(TILTAKSPAKKE_ID),
    status: TiltakspakkeVurderingStatusSchema,
  })
  .strict();

export type TiltakspakkeStatus = TiltakspakkeVurderingStatus | "UKJENT";

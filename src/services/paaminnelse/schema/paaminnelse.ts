import { z } from "zod";

const rawPaaminnelseStatuses = ["SKJULT", "TILBUD", "BESTILT"] as const;

export type RawPaaminnelseResponse = z.infer<
  typeof RawPaaminnelseResponseSchema
>;
export const RawPaaminnelseResponseSchema = z
  .object({
    status: z.enum(rawPaaminnelseStatuses),
    reminderTiming: z
      .object({
        code: z.string().optional(),
        textKey: z.string().optional(),
        triggerAt: z.string().optional(),
      })
      .strict()
      .optional(),
  })
  .strict();

export type PaaminnelseIdentifikatorer = {
  orgnummer: string;
  fnr?: string;
};

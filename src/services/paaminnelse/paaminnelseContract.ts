import { z } from "zod";

const paaminnelseFeilkoder = [
  "UGYLDIG_FORESPORSEL",
  "IKKE_AUTORISERT",
  "STATUS_FEILET",
  "BESTILLING_FEILET",
  "AVBESTILLING_FEILET",
] as const;

export type ReminderTiming = z.infer<typeof ReminderTimingSchema>;
// Backend-owned read-only timing/rule info. Only safe codes, text keys and an
// optional timestamp are allowed here. Key formats reduce accidental leakage,
// but real PII filtering must happen before values are mapped into this DTO.
export const ReminderTimingSchema = z
  .object({
    code: z
      .string()
      .max(64)
      .regex(/^[A-Z][A-Z0-9_]*$/)
      .optional(),
    textKey: z
      .string()
      .max(128)
      .regex(/^[A-Za-z][A-Za-z0-9._-]*$/)
      .optional(),
    triggerAt: z.string().datetime({ offset: true }).optional(),
  })
  .strict()
  .refine(
    ({ code, textKey, triggerAt }) =>
      code !== undefined || textKey !== undefined || triggerAt !== undefined,
    {
      message: "Reminder timing must include at least one read-only value",
    },
  );

const PaaminnelseSynligStatusSchema = z.object({
  reminderTiming: ReminderTimingSchema.optional(),
});

export type PaaminnelseSkjultStatus = z.infer<
  typeof PaaminnelseSkjultStatusSchema
>;
export const PaaminnelseSkjultStatusSchema = z
  .object({
    status: z.literal("SKJULT"),
  })
  .strict();

export type PaaminnelseTilbudStatus = z.infer<
  typeof PaaminnelseTilbudStatusSchema
>;
export const PaaminnelseTilbudStatusSchema =
  PaaminnelseSynligStatusSchema.extend({
    status: z.literal("TILBUD"),
  }).strict();

export type PaaminnelseBestiltStatus = z.infer<
  typeof PaaminnelseBestiltStatusSchema
>;
export const PaaminnelseBestiltStatusSchema =
  PaaminnelseSynligStatusSchema.extend({
    status: z.literal("BESTILT"),
  }).strict();

export type PaaminnelseStatus = z.infer<typeof PaaminnelseStatusSchema>;
export const PaaminnelseStatusSchema = z.discriminatedUnion("status", [
  PaaminnelseSkjultStatusSchema,
  PaaminnelseTilbudStatusSchema,
  PaaminnelseBestiltStatusSchema,
]);

export type HentPaaminnelseStatusResponse = z.infer<
  typeof HentPaaminnelseStatusResponseSchema
>;
export const HentPaaminnelseStatusResponseSchema = PaaminnelseStatusSchema;

export type BestillPaaminnelseRequest = z.infer<
  typeof BestillPaaminnelseRequestSchema
>;
// POST does not accept user-selected timing or identifiers in phase 1.
export const BestillPaaminnelseRequestSchema = z.object({}).strict().optional();

export type BestillPaaminnelseResponse = z.infer<
  typeof BestillPaaminnelseResponseSchema
>;
export const BestillPaaminnelseResponseSchema = PaaminnelseStatusSchema;

export type AvbestillPaaminnelseResponse = z.infer<
  typeof AvbestillPaaminnelseResponseSchema
>;
export const AvbestillPaaminnelseResponseSchema = PaaminnelseStatusSchema;

export type PaaminnelseFeilkode = z.infer<typeof PaaminnelseFeilkodeSchema>;
export const PaaminnelseFeilkodeSchema = z.enum(paaminnelseFeilkoder);

export type PaaminnelseFeilResponse = z.infer<
  typeof PaaminnelseFeilResponseSchema
>;
// Free-text backend messages are intentionally not part of the client contract.
export const PaaminnelseFeilResponseSchema = z
  .object({
    feilkode: PaaminnelseFeilkodeSchema,
  })
  .strict();

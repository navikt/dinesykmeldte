import { formatISO, isValid, parseISO } from "date-fns";
import { z } from "zod";

export const DateSchema = z
  .string()
  .refine((date) => isValid(parseISO(date)), {
    message: "Invalid date string",
  });

export const DateTimeSchema = z
  .string()
  .refine((date) => isValid(parseISO(date)), { message: "Invalid date string" })
  .transform((date) => formatISO(parseISO(date), { representation: "date" }));

export const MessageResponseSchema = z.object({
  message: z.string(),
});

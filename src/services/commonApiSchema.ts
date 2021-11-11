import { z } from 'zod';
import { parseISO, isValid } from 'date-fns';

export const LocalDateSchema = z.string().refine((date) => isValid(parseISO(date)), { message: 'Invalid date string' });

export const PreviewSykmeldingSchema = z.object({
    id: z.string(),
    fom: LocalDateSchema,
    tom: LocalDateSchema,
    type: z.string(),
    lest: z.boolean(),
});

export const PreviewSoknadSchema = z.object({
    id: z.string(),
    sykmeldingId: z.string().nullable(),
    fom: LocalDateSchema.nullable(),
    tom: LocalDateSchema.nullable(),
    status: z.string(),
    sendtDato: LocalDateSchema.nullable(),
    lest: z.boolean(),
});

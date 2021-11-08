import { z } from 'zod';

export const PreviewSykmeldingSchema = z.object({
    id: z.string(),
    // TODO date it
    fom: z.string(),
    // TODO date it
    tom: z.string(),
    type: z.string(),
    lest: z.boolean(),
});

export const PreviewSoknadSchema = z.object({
    id: z.string(),
    sykmeldingId: z.string().nullable(),
    // TODO date it
    fom: z.string().nullable(),
    // TODO date it
    tom: z.string().nullable(),
    status: z.string(),
    // TODO date it
    sendtDato: z.string().nullable(),
    lest: z.boolean(),
});

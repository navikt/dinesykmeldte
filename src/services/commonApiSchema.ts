import { z } from 'zod';
import { parseISO, isValid, formatISO } from 'date-fns';

import { ArbeidsrelatertArsakEnum, PeriodeEnum, SoknadsstatusEnum } from '../graphql/resolvers/resolvers.generated';

export const DateSchema = z.string().refine((date) => isValid(parseISO(date)), { message: 'Invalid date string' });
export const DateTimeSchema = z
    .string()
    .refine((date) => isValid(parseISO(date)), { message: 'Invalid date string' })
    .transform((date) => formatISO(parseISO(date), { representation: 'date' }));

export const SoknadsperiodeSchema = z.object({
    fom: DateSchema,
    tom: DateSchema,
    sykmeldingsgrad: z.number().nullable(),
    sykmeldingstype: z.nativeEnum(PeriodeEnum),
});

export const BasePreviewSoknadSchema = z.object({
    id: z.string(),
    sykmeldingId: z.string(),
    fom: DateSchema,
    tom: DateSchema,
    perioder: z.array(SoknadsperiodeSchema),
});

export type PreviewSendtSoknadApi = z.infer<typeof PrewievSendtSoknadSchema>;
export const PrewievSendtSoknadSchema = BasePreviewSoknadSchema.extend({
    korrigererSoknadId: z.string().nullable(),
    lest: z.boolean(),
    sendtDato: DateTimeSchema,
    status: z.literal(SoknadsstatusEnum.Sendt),
});

export type PreviewNySoknadApi = z.infer<typeof PreviewNySoknadSchema>;
export const PreviewNySoknadSchema = BasePreviewSoknadSchema.extend({
    status: z.literal(SoknadsstatusEnum.Ny),
    ikkeSendtSoknadVarsel: z.boolean(),
});

export type PreviewFremtidigSoknadApi = z.infer<typeof PreviewFremtidigSoknadSchema>;
export const PreviewFremtidigSoknadSchema = BasePreviewSoknadSchema.extend({
    status: z.literal(SoknadsstatusEnum.Fremtidig),
});

export type PreviewSoknadApi = z.infer<typeof PreviewSoknadSchema>;
export const PreviewSoknadSchema = z.discriminatedUnion('status', [
    PrewievSendtSoknadSchema,
    PreviewNySoknadSchema,
    PreviewFremtidigSoknadSchema,
]);

export const ArbeidsgiverSchema = z.object({
    navn: z.string().nullable(),
});

export const BehandlerSchema = z.object({
    navn: z.string(),
    hprNummer: z.string().nullable(),
    telefon: z.string().nullable(),
});

export const Periode = z.object({
    fom: DateSchema,
    tom: DateSchema,
});

export const ArbeidsrelatertArsakSchemaEnum = z.nativeEnum(ArbeidsrelatertArsakEnum);

export const ArbeidsrelatertArsakSchema = z.object({
    arsak: z.array(ArbeidsrelatertArsakSchemaEnum),
    beskrivelse: z.string().nullable(),
});

export type AktivitetIkkeMuligApi = z.infer<typeof AktivitetIkkeMuligSchema>;
export const AktivitetIkkeMuligSchema = Periode.extend({
    type: z.literal(PeriodeEnum.AktivitetIkkeMulig),
    arbeidsrelatertArsak: ArbeidsrelatertArsakSchema.nullable(),
});

export type GradertApi = z.infer<typeof GradertSchema>;
export const GradertSchema = Periode.extend({
    type: z.literal(PeriodeEnum.Gradert),
    grad: z.number(),
    reisetilskudd: z.boolean(),
});

export type BehandlingsdagerApi = z.infer<typeof BehandlingsdagerSchema>;
export const BehandlingsdagerSchema = Periode.extend({
    type: z.literal(PeriodeEnum.Behandlingsdager),
    behandlingsdager: z.number(),
});

export type ReisetilskuddApi = z.infer<typeof ReisetilskuddSchema>;
export const ReisetilskuddSchema = Periode.extend({
    type: z.literal(PeriodeEnum.Reisetilskudd),
});

export type AvventendeApi = z.infer<typeof AvventendeSchema>;
export const AvventendeSchema = Periode.extend({
    type: z.literal(PeriodeEnum.Avventende),
    tilrettelegging: z.string().nullable(),
});

export type DialogmoteApi = z.infer<typeof DialogmoteSchema>;
export const DialogmoteSchema = z.object({
    hendelseId: z.string(),
    tekst: z.string().nullable(),
});

export type AktivitetsvarselApi = z.infer<typeof AktivitetsvarselSchema>;
export const AktivitetsvarselSchema = z.object({
    hendelseId: z.string(),
    mottatt: DateTimeSchema,
    lest: DateTimeSchema.nullable(),
});

import { z } from 'zod';
import { parseISO, isValid } from 'date-fns';

import { ArbeidsrelatertArsakEnum, PeriodeEnum, SoknadsstatusEnum } from '../graphql/resolvers/resolvers.generated';

export const LocalDateSchema = z.string().refine((date) => isValid(parseISO(date)), { message: 'Invalid date string' });

export const PreviewSykmeldingSchema = z.object({
    id: z.string(),
    fom: LocalDateSchema,
    tom: LocalDateSchema,
    type: z.string(),
    lest: z.boolean(),
});

export const SoknadsperiodeSchema = z.object({
    fom: LocalDateSchema,
    tom: LocalDateSchema,
    sykmeldingsgrad: z.number().nullable(),
    sykmeldingstype: z.nativeEnum(PeriodeEnum),
});

export const BasePreviewSoknadSchema = z.object({
    id: z.string(),
    sykmeldingId: z.string(),
    fom: LocalDateSchema,
    tom: LocalDateSchema,
    perioder: z.array(SoknadsperiodeSchema),
});

export const SendtSoknad = BasePreviewSoknadSchema.extend({
    korrigertBySoknadId: z.string().nullable(),
    lest: z.boolean(),
    sendtDato: LocalDateSchema,
    status: z.literal(SoknadsstatusEnum.Sendt),
});

export const NySoknad = BasePreviewSoknadSchema.extend({
    frist: LocalDateSchema,
    varsel: z.boolean(),
    status: z.literal(SoknadsstatusEnum.Ny),
});

export const FremtidigSoknad = BasePreviewSoknadSchema.extend({
    status: z.literal(SoknadsstatusEnum.Fremtidig),
});

export const KorrigertSoknad = BasePreviewSoknadSchema.extend({
    korrigertBySoknadId: z.string(),
    korrigererSoknadId: z.string().nullable(),
    status: z.literal(SoknadsstatusEnum.Korrigert),
});

export const PreviewSoknadSchema = z.union([SendtSoknad, NySoknad, FremtidigSoknad, KorrigertSoknad]);

export const ArbeidsgiverSchema = z.object({
    orgnummer: z.string(),
    navn: z.string().nullable(),
    yrke: z.string().nullable(),
});

export const BehandlerSchema = z.object({
    navn: z.string(),
    hprNummer: z.string().nullable(),
    telefon: z.string().nullable(),
});

export const Periode = z.object({
    fom: LocalDateSchema,
    tom: LocalDateSchema,
});

export const ArbeidsrelatertArsakSchemaEnum = z.nativeEnum(ArbeidsrelatertArsakEnum);

export const ArbeidsrelatertArsakSchema = z.object({
    arsak: z.array(ArbeidsrelatertArsakSchemaEnum),
    beskrivelse: z.string().nullable(),
});

export const AktivitetIkkeMulig = Periode.extend({
    type: z.literal(PeriodeEnum.AktivitetIkkeMulig),
    arbeidsrelatertArsak: ArbeidsrelatertArsakSchema.nullable(),
});

export const Gradert = Periode.extend({
    type: z.literal(PeriodeEnum.Gradert),
    grad: z.number(),
    reisetilskudd: z.boolean(),
});

export const Behandlingsdager = Periode.extend({
    type: z.literal(PeriodeEnum.Behandlingsdager),
    behandlingsdager: z.number(),
});

export const Reisetilskudd = Periode.extend({
    type: z.literal(PeriodeEnum.Reisetilskudd),
});

export const Avventende = Periode.extend({
    type: z.literal(PeriodeEnum.Avventende),
    tilrettelegging: z.string().nullable(),
});

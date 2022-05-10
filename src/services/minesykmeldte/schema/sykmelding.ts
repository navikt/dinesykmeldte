import { z } from 'zod';

import { ArbeidsrelatertArsakEnum, PeriodeEnum } from '../../../graphql/resolvers/resolvers.generated';

import { DateSchema } from './common';

export const Arbeidsgiver = z.object({
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

export type SykmeldingPeriodeApi = z.infer<typeof SykmeldingsPeriodeSchema>;
const SykmeldingsPeriodeSchema = z.discriminatedUnion('type', [
    AktivitetIkkeMuligSchema,
    GradertSchema,
    BehandlingsdagerSchema,
    ReisetilskuddSchema,
    AvventendeSchema,
]);
export type SykmeldingApi = z.infer<typeof SykmeldingSchema>;
export const SykmeldingSchema = z.object({
    id: z.string(),
    kontaktDato: DateSchema.nullable(),
    navn: z.string(),
    fnr: z.string(),
    lest: z.boolean(),
    behandletTidspunkt: DateSchema,
    arbeidsgiver: Arbeidsgiver,
    perioder: z.array(SykmeldingsPeriodeSchema),
    arbeidsforEtterPeriode: z.boolean().nullable(),
    hensynArbeidsplassen: z.string().nullable(),
    tiltakArbeidsplassen: z.string().nullable(),
    innspillArbeidsplassen: z.string().nullable(),
    behandler: BehandlerSchema,
    sendtTilArbeidsgiverDato: DateSchema.nullable(),
});

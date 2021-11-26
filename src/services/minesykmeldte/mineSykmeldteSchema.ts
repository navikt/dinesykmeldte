import { z } from 'zod';

import {
    AktivitetIkkeMulig,
    ArbeidsgiverSchema,
    Avventende,
    BehandlerSchema,
    Behandlingsdager,
    Gradert,
    LocalDateSchema,
    PreviewSoknadSchema,
    PreviewSykmeldingSchema,
    Reisetilskudd,
} from '../commonApiSchema';
import { SoknadsstatusEnum, SoknadstypeEnum } from '../../graphql/resolvers/resolvers.generated';

export const MineSykmeldteApiSchema = z.array(
    z.object({
        narmestelederId: z.string(),
        orgnummer: z.string(),
        fnr: z.string(),
        navn: z.string(),
        startdatoSykefravar: LocalDateSchema,
        friskmeldt: z.boolean(),
        previewSykmeldinger: z.array(PreviewSykmeldingSchema),
        previewSoknader: z.array(PreviewSoknadSchema),
    }),
);

const SykmeldingsPeriodeSchema = z.union([AktivitetIkkeMulig, Gradert, Behandlingsdager, Reisetilskudd, Avventende]);

export const SykmeldingSchema = z.object({
    id: z.string(),
    startdatoSykefravar: LocalDateSchema,
    kontaktDato: LocalDateSchema.nullable(),
    navn: z.string(),
    fnr: z.string(),
    lest: z.boolean(),
    arbeidsgiver: ArbeidsgiverSchema,
    perioder: z.array(SykmeldingsPeriodeSchema),
    arbeidsforEtterPeriode: z.boolean().nullable(),
    hensynArbeidsplassen: z.string().nullable(),
    tiltakArbeidsplassen: z.string().nullable(),
    innspillArbeidsplassen: z.string().nullable(),
    behandler: BehandlerSchema,
});

const SoknadDetailsSchema = z.object({
    type: z.nativeEnum(SoknadstypeEnum),
    status: z.nativeEnum(SoknadsstatusEnum),
});

export const SoknadSchema = z.object({
    id: z.string(),
    sykmeldingId: z.string(),
    navn: z.string(),
    fnr: z.string(),
    lest: z.boolean(),
    orgnummer: z.string(),
    sendtDato: LocalDateSchema,
    tom: LocalDateSchema,
    details: SoknadDetailsSchema,
});

export const MarkReadSchema = z.object({
    message: z.string(),
});

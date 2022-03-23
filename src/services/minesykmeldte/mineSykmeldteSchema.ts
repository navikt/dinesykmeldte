import { z } from 'zod';

import {
    AktivitetIkkeMulig,
    ArbeidsgiverSchema,
    Avventende,
    BehandlerSchema,
    Behandlingsdager,
    DialogmoteSchema,
    Gradert,
    LocalDateSchema,
    PreviewSoknadSchema,
    PreviewSykmeldingSchema,
    Reisetilskudd,
    SoknadsperiodeSchema,
} from '../commonApiSchema';
import { Soknad } from '../../graphql/resolvers/resolvers.generated';
import { SoknadSporsmalSchema } from '../../shared/schema';

export const VirksomheterApiSchema = z.array(
    z.object({
        navn: z.string(),
        orgnummer: z.string(),
    }),
);

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
        dialogmoter: z.array(DialogmoteSchema),
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

export const SoknadSporsmalSvarSchema = z.object({
    verdi: z.string(),
});

export const SoknadSchema: z.ZodSchema<Soknad> = z.object({
    id: z.string(),
    sykmeldingId: z.string(),
    fnr: z.string(),
    navn: z.string(),
    fom: LocalDateSchema,
    tom: LocalDateSchema,
    lest: z.boolean(),
    korrigererSoknadId: z.string().nullable(),
    korrigertBySoknadId: z.string().nullable(),
    perioder: z.array(SoknadsperiodeSchema),
    sporsmal: z.array(SoknadSporsmalSchema),
});

export const MessageResponseSchema = z.object({
    message: z.string(),
});

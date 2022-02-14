import { z } from 'zod';

import {
    AktivitetIkkeMulig,
    ArbeidsgiverSchema,
    Avventende,
    BehandlerSchema,
    Behandlingsdager,
    Gradert,
    DialogmoteSchema,
    LocalDateSchema,
    PreviewSoknadSchema,
    PreviewSykmeldingSchema,
    Reisetilskudd,
    SoknadsperiodeSchema,
} from '../commonApiSchema';
import {
    SoknadSporsmal,
    SoknadSporsmalSvartypeEnum,
    SoknadSporsmalKriterierEnum,
} from '../../graphql/resolvers/resolvers.generated';

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

export const SoknadSporsmalSchema: z.ZodSchema<SoknadSporsmal> = z.lazy(() =>
    z.object({
        id: z.string(),
        tag: z.string(),
        min: z.string().nullable(),
        max: z.string().nullable(),
        sporsmalstekst: z.string(),
        undertekst: z.string().nullable(),
        svartype: z.nativeEnum(SoknadSporsmalSvartypeEnum),
        kriterieForVisningAvUndersporsmal: z.nativeEnum(SoknadSporsmalKriterierEnum).nullable(),
        svar: z.array(SoknadSporsmalSvarSchema).nullable(),
        undersporsmal: z.array(SoknadSporsmalSchema).nullable(),
    }),
);

export const SoknadSchema = z.object({
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

import { z } from 'zod';

import {
    AktivitetIkkeMuligSchema,
    ArbeidsgiverSchema,
    AvventendeSchema,
    BehandlerSchema,
    BehandlingsdagerSchema,
    GradertSchema,
    DialogmoteSchema,
    DateSchema,
    PreviewSoknadSchema,
    ReisetilskuddSchema,
    SoknadsperiodeSchema,
    AktivitetsvarselSchema,
} from '../commonApiSchema';
import {
    SoknadSporsmal,
    SoknadSporsmalSvartypeEnum,
    SoknadSporsmalKriterierEnum,
    SporsmalTagEnum,
} from '../../graphql/resolvers/resolvers.generated';

export type VirksomhetApi = z.infer<typeof VirksomhetSchema>;
const VirksomhetSchema = z.object({
    navn: z.string(),
    orgnummer: z.string(),
});

export const VirksomheterApiSchema = z.array(VirksomhetSchema);

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
    startdatoSykefravar: DateSchema,
    kontaktDato: DateSchema.nullable(),
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

export type PreviewSykmeldtApi = z.infer<typeof PreviewSykmeldtSchema>;
export const PreviewSykmeldtSchema = z.object({
    narmestelederId: z.string(),
    orgnummer: z.string(),
    fnr: z.string(),
    navn: z.string(),
    startdatoSykefravar: DateSchema,
    friskmeldt: z.boolean(),
    aktivitetsvarsler: z.array(AktivitetsvarselSchema),
    sykmeldinger: z.array(SykmeldingSchema),
    previewSoknader: z.array(PreviewSoknadSchema),
    dialogmoter: z.array(DialogmoteSchema),
});

export type MineSykmeldteApi = z.infer<typeof MineSykmeldteApiSchema>;
export const MineSykmeldteApiSchema = z.array(PreviewSykmeldtSchema);

export const SoknadSporsmalSvarSchema = z.object({
    verdi: z.string(),
});

export const SoknadSporsmalSchema: z.ZodSchema<SoknadSporsmal> = z.lazy(() =>
    z.object({
        id: z.string(),
        tag: z.preprocess(removeSporsmalTagPostfixNumber, z.nativeEnum(SporsmalTagEnum)),
        min: z.string().nullable(),
        max: z.string().nullable(),
        sporsmalstekst: z.string().nullable(),
        undertekst: z.string().nullable(),
        svartype: z.nativeEnum(SoknadSporsmalSvartypeEnum),
        kriterieForVisningAvUndersporsmal: z.nativeEnum(SoknadSporsmalKriterierEnum).nullable(),
        svar: z.array(SoknadSporsmalSvarSchema).nullable(),
        undersporsmal: z.array(SoknadSporsmalSchema).nullable(),
    }),
);

export type SoknadApi = z.infer<typeof SoknadSchema>;
export const SoknadSchema = z.object({
    id: z.string(),
    sykmeldingId: z.string(),
    fnr: z.string(),
    navn: z.string(),
    fom: DateSchema,
    tom: DateSchema,
    lest: z.boolean(),
    korrigererSoknadId: z.string().nullable(),
    perioder: z.array(SoknadsperiodeSchema),
    sporsmal: z.array(SoknadSporsmalSchema),
});

export const MessageResponseSchema = z.object({
    message: z.string(),
});

export function removeSporsmalTagPostfixNumber(value: unknown): string {
    return String(value).replace(/(_\d+)$/gm, '');
}

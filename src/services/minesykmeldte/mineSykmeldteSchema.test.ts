/* eslint-disable @typescript-eslint/no-unused-vars */
import {
    PreviewNySoknad,
    PreviewSendtSoknad,
    PreviewFremtidigSoknad,
    AktivitetIkkeMulig,
    Avventende,
    Behandlingsdager,
    Gradert,
    Reisetilskudd,
} from '../../graphql/resolvers/resolvers.generated';
import {
    PreviewFremtidigSoknadSchema,
    PreviewNySoknadSchema,
    PrewievSendtSoknadSchema,
    AktivitetIkkeMuligSchema,
    GradertSchema,
    BehandlingsdagerSchema,
    ReisetilskuddSchema,
    AvventendeSchema,
} from '../commonApiSchema';

import { removeSporsmalTagPostfixNumber } from './mineSykmeldteSchema';

describe('mineSykmeldteSchema', () => {
    describe('removeSporsmalTagPostfixNumber', () => {
        it.each([
            ['JOBBET_DU_100_PROSENT_0', 'JOBBET_DU_100_PROSENT'],
            ['JOBBET_DU_100_PROSENT_1', 'JOBBET_DU_100_PROSENT'],
            ['JOBBET_DU_100_PROSENT_2', 'JOBBET_DU_100_PROSENT'],
            ['JOBBET_DU_100_PROSENT_3', 'JOBBET_DU_100_PROSENT'],
            ['HVOR_MANGE_TIMER_PER_UKE_0', 'HVOR_MANGE_TIMER_PER_UKE'],
            ['HVOR_MYE_HAR_DU_JOBBET_0', 'HVOR_MYE_HAR_DU_JOBBET'],
            ['HVOR_MYE_TIMER_0', 'HVOR_MYE_TIMER'],
            ['HVOR_MYE_TIMER_VERDI_0', 'HVOR_MYE_TIMER_VERDI'],
            ['HVOR_MYE_PROSENT_0', 'HVOR_MYE_PROSENT'],
            ['HVOR_MYE_PROSENT_VERDI_0', 'HVOR_MYE_PROSENT_VERDI'],
            ['HVOR_MYE_PROSENT_VERDI_69', 'HVOR_MYE_PROSENT_VERDI'],
        ])('should fix %s to match %s', (input, expected) => {
            expect(removeSporsmalTagPostfixNumber(input)).toEqual(expected);
        });

        it.each([
            'ANSVARSERKLARING',
            'FRAVAR_FOR_SYKMELDINGEN',
            'PERMISJON_NAR_V2',
            'UTLAND_V2',
            'UTDANNING',
            'FULLTIDSSTUDIUM',
            'PERMITTERT_NAA',
            'PERMITTERT_PERIODE',
            'VAER_KLAR_OVER_AT',
        ])('should not change %s', (input) => {
            expect(removeSporsmalTagPostfixNumber(input)).toEqual(input);
        });
    });

    it('should match typescript types for søknad union', () => {
        const parse = (): void => {
            // This test only provides type errors
            const fremtidig: PreviewFremtidigSoknad = PreviewFremtidigSoknadSchema.parse({});
            const sendt: PreviewSendtSoknad = PrewievSendtSoknadSchema.parse({});
            const ny: PreviewNySoknad = PreviewNySoknadSchema.parse({});
        };

        expect(parse).toThrow();
    });

    it('should match typescript types for sykmeldingsperiode union', () => {
        const parse = (): void => {
            // This test only provides type errors
            const aktivitetIkkeMulig: AktivitetIkkeMulig = AktivitetIkkeMuligSchema.parse({});
            const avventende: Avventende = AvventendeSchema.parse({});
            const behandlingsdager: Behandlingsdager = BehandlingsdagerSchema.parse({});
            const gradert: Gradert = GradertSchema.parse({});
            const reisetilskudd: Reisetilskudd = ReisetilskuddSchema.parse({});
        };

        expect(parse).toThrow();
    });
});

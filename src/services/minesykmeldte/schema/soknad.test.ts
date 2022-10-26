import { removeSporsmalTagPostfixNumber } from './soknad'

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
        expect(removeSporsmalTagPostfixNumber(input)).toEqual(expected)
    })

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
        expect(removeSporsmalTagPostfixNumber(input)).toEqual(input)
    })
})

import { add, sub } from 'date-fns';

import {
    SykmeldingPeriode_AktivitetIkkeMulig_Fragment,
    SykmeldingPeriode_Avventende_Fragment,
    SykmeldingPeriode_Behandlingsdager_Fragment,
    SykmeldingPeriode_Gradert_Fragment,
    SykmeldingPeriode_Reisetilskudd_Fragment,
} from '../graphql/queries/graphql.generated';

import { createAktivitetIkkeMuligPeriode, createGradertPeriode, createSykmelding } from './test/dataCreators';
import {
    formatPeriodsRelative,
    getRelativeSykmeldingPeriodStatus,
    getSykmeldingPeriodDescription,
} from './sykmeldingPeriodUtils';
import { dateAdd, dateSub, formatDate, toDateString } from './dateUtils';

describe('getSykmeldingPeriodDescription', () => {
    it('Avventende periode', () => {
        const period: SykmeldingPeriode_Avventende_Fragment = {
            __typename: 'Avventende',
            fom: '2021-04-01',
            tom: '2021-04-03',
            tilrettelegging: 'Dette er et innspill',
        };
        expect(getSykmeldingPeriodDescription(period)).toBe('Avventende sykmelding i 3 dager');
    });

    it('100% periode', () => {
        const period: SykmeldingPeriode_AktivitetIkkeMulig_Fragment = {
            __typename: 'AktivitetIkkeMulig',
            fom: '2021-04-01',
            tom: '2021-04-03',
            arbeidsrelatertArsak: null,
        };
        expect(getSykmeldingPeriodDescription(period)).toBe('100% sykmeldt i 3 dager');
    });

    it('Gradert periode', () => {
        const period: SykmeldingPeriode_Gradert_Fragment = {
            __typename: 'Gradert',
            fom: '2021-04-01',
            tom: '2021-04-03',
            grad: 80,
            reisetilskudd: false,
        };
        expect(getSykmeldingPeriodDescription(period)).toBe('80% sykmeldt i 3 dager');
    });

    it('Reisetilskudd periode', () => {
        const period: SykmeldingPeriode_Reisetilskudd_Fragment = {
            __typename: 'Reisetilskudd',
            fom: '2021-04-01',
            tom: '2021-04-03',
        };
        expect(getSykmeldingPeriodDescription(period)).toBe('Reisetilskudd i 3 dager');
    });

    it('1 behandlingsdag periode', () => {
        const period: SykmeldingPeriode_Behandlingsdager_Fragment = {
            __typename: 'Behandlingsdager',
            fom: '2021-04-01',
            tom: '2021-04-03',
            behandlingsdager: 1,
        };

        expect(getSykmeldingPeriodDescription(period)).toBe('1 behandlingsdag i løpet av 3 dager');
    });

    it('Flere behandlingsdager periode', () => {
        const period: SykmeldingPeriode_Behandlingsdager_Fragment = {
            __typename: 'Behandlingsdager',
            fom: '2021-04-01',
            tom: '2021-04-03',
            behandlingsdager: 2,
        };
        expect(getSykmeldingPeriodDescription(period)).toBe('2 behandlingsdager i løpet av 3 dager');
    });
});

describe('getRelativeSykmeldingPeriodStatus', () => {
    it('should handle time in the past', () => {
        const result = getRelativeSykmeldingPeriodStatus(
            createAktivitetIkkeMuligPeriode({
                fom: toDateString(sub(new Date(), { days: 25 })),
                tom: toDateString(sub(new Date(), { days: 15 })),
            }),
        );

        expect(result).toEqual('Ferdig');
    });

    it('should handle time in the present', () => {
        const result = getRelativeSykmeldingPeriodStatus(
            createAktivitetIkkeMuligPeriode({
                fom: toDateString(sub(new Date(), { days: 10 })),
                tom: toDateString(add(new Date(), { days: 10 })),
            }),
        );

        expect(result).toEqual('9 dager gjenstår');
    });

    it('should handle time in the present, when start date is today', () => {
        const result = getRelativeSykmeldingPeriodStatus(
            createAktivitetIkkeMuligPeriode({
                fom: toDateString(new Date()),
                tom: toDateString(add(new Date(), { days: 10 })),
            }),
        );

        expect(result).toEqual('9 dager gjenstår');
    });

    it('should handle time in the present, when end date is today', () => {
        const result = getRelativeSykmeldingPeriodStatus(
            createAktivitetIkkeMuligPeriode({
                fom: toDateString(sub(new Date(), { days: 10 })),
                tom: toDateString(new Date()),
            }),
        );

        expect(result).toEqual('en dag gjenstår');
    });

    it('should handle time in the present, when end date is way in future', () => {
        const result = getRelativeSykmeldingPeriodStatus(
            createAktivitetIkkeMuligPeriode({
                fom: toDateString(sub(new Date(), { days: 10 })),
                tom: toDateString(add(new Date(), { days: 100 })),
            }),
        );

        expect(result).toEqual('99 dager gjenstår');
    });

    it('should handle time in the future', () => {
        const result = getRelativeSykmeldingPeriodStatus(
            createAktivitetIkkeMuligPeriode({
                fom: toDateString(add(new Date(), { days: 10 })),
                tom: toDateString(add(new Date(), { days: 20 })),
            }),
        );

        expect(result).toEqual('Starter om 9 dager');
    });
});

describe('formatPeriodsRelative', () => {
    it('should format past aktivitet ikke mulig period correct without name', () => {
        const result = formatPeriodsRelative(
            'Viktor Krum',
            [
                createSykmelding({
                    perioder: [createAktivitetIkkeMuligPeriode()],
                }),
            ],
            false,
        );

        expect(result.text).toEqual('Sist sykmeldt 8. august 2021 - 15. august 2021');
    });

    it('should format past aktivitet ikke mulig period correct with name', () => {
        const result = formatPeriodsRelative(
            'Viktor Krum',
            [
                createSykmelding({
                    perioder: [createAktivitetIkkeMuligPeriode()],
                }),
            ],
            true,
        );

        expect(result.text).toEqual('Viktor var sist sykmeldt 8. august 2021 - 15. august 2021');
    });

    it('should format past gradert period correct with name', () => {
        const result = formatPeriodsRelative(
            'Viktor Krum',
            [
                createSykmelding({
                    perioder: [createGradertPeriode({ grad: 70 })],
                }),
            ],
            true,
        );

        expect(result.text).toEqual('Viktor var sist sykmeldt 16. august 2021 - 20. august 2021');
    });

    it('should format current gradert period correct with name', () => {
        const now = new Date();
        const tom = dateAdd(now, { days: 5 });
        const result = formatPeriodsRelative(
            'Viktor Krum',
            [
                createSykmelding({
                    perioder: [
                        createGradertPeriode({
                            grad: 70,
                            fom: dateSub(now, { days: 5 }),
                            tom: tom,
                        }),
                    ],
                }),
            ],
            true,
        );

        const date = formatDate(tom);

        expect(result.text).toEqual(`Viktor er 70% sykmeldt til ${date}`);
    });

    it('should format future gradert period correct with name', () => {
        const now = new Date();
        const fom = dateAdd(now, { days: 10 });
        const result = formatPeriodsRelative(
            'Viktor Krum',
            [
                createSykmelding({
                    perioder: [
                        createGradertPeriode({
                            grad: 60,
                            fom: fom,
                            tom: dateAdd(now, { days: 20 }),
                        }),
                    ],
                }),
            ],
            true,
        );

        const date = formatDate(fom);

        expect(result.text).toEqual(`Viktor er 60% sykmeldt fra ${date}`);
    });
});

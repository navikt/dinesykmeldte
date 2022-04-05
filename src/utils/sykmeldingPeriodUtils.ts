import {
    compareAsc,
    compareDesc,
    formatDistanceStrict,
    formatISO,
    isAfter,
    isFuture,
    isPast,
    isToday,
    isWithinInterval,
    max,
    min,
    parseISO,
    startOfDay,
} from 'date-fns';
import { nb } from 'date-fns/locale';

import { SykmeldingFragment, SykmeldingPeriodeFragment } from '../graphql/queries/graphql.generated';

import { diffInDays, formatDate, toDate } from './dateUtils';

export function getSykmeldingPeriodDescription(period: SykmeldingPeriodeFragment): string {
    const periodLength = diffInDays(period.fom, period.tom);

    switch (period.__typename) {
        case 'AktivitetIkkeMulig':
            return `100% sykmeldt i ${periodLength} dag${periodLength > 1 ? 'er' : ''}`;
        case 'Gradert':
            return `${period.grad}% sykmeldt i ${periodLength} dag${periodLength > 1 ? 'er' : ''}`;
        case 'Behandlingsdager':
            return `${period.behandlingsdager} behandlingsdag${
                period.behandlingsdager > 1 ? 'er' : ''
            } i løpet av ${periodLength} dag${periodLength > 1 ? 'er' : ''}`;
        case 'Avventende':
            return `Avventende sykmelding i ${periodLength} dag${periodLength > 1 ? 'er' : ''}`;
        case 'Reisetilskudd':
            return `Reisetilskudd i ${periodLength} dag${periodLength > 1 ? 'er' : ''}`;
    }
}

export function getShortSykmeldingPeriodDescription(period: SykmeldingPeriodeFragment): string {
    switch (period.__typename) {
        case 'AktivitetIkkeMulig':
            return `100%`;
        case 'Gradert':
            return `${period.grad}%`;
        case 'Behandlingsdager':
            return `Behandlingsdager`;
        case 'Avventende':
            return `Avventende`;
        case 'Reisetilskudd':
            return `Reisetilskudd`;
    }
}

export function getRelativeSykmeldingPeriodStatus(period: SykmeldingPeriodeFragment): string {
    const fom = parseISO(period.fom);
    const tom = parseISO(period.tom);
    const today = startOfDay(new Date());

    if (isFuture(fom)) {
        return `Starter om ${formatDistanceStrict(fom, today, { locale: nb, unit: 'day' })}`;
    } else if (!isToday(tom) && isWithinInterval(today, { start: fom, end: tom })) {
        return `${formatDistanceStrict(tom, today, { locale: nb, unit: 'day' })} gjenstår`;
    } else {
        return `Ferdig`;
    }
}

export function createPeriodeKey(periode: SykmeldingPeriodeFragment): string {
    return `${periode.fom}-${periode.tom}`;
}

export function periodByDateAsc(a: SykmeldingPeriodeFragment, b: SykmeldingPeriodeFragment): number {
    return compareAsc(parseISO(a.tom), parseISO(b.tom));
}

export function periodByDateDesc(a: SykmeldingPeriodeFragment, b: SykmeldingPeriodeFragment): number {
    return compareDesc(parseISO(a.tom), parseISO(b.tom));
}

export function getPeriodTime(sykmeldinger: SykmeldingFragment[]): 'past' | 'present' | 'future' {
    const now = new Date();
    const periods = sykmeldinger.flatMap((it) => it.perioder).sort(periodByDateAsc);
    const earliestFom = parseISO(periods[0].fom);
    const latestTom = parseISO(periods[periods.length - 1].tom);

    const currentPeriod = periods.find((period) =>
        isWithinInterval(now, { start: parseISO(period.fom), end: parseISO(period.tom) }),
    );

    if (isFuture(earliestFom)) {
        return 'future';
    } else if (isPast(latestTom)) {
        return 'past';
    }

    if (currentPeriod) {
        return 'present';
    } else {
        return 'future';
    }
}

export function formatPeriodsRelative(
    name: string,
    sykmeldinger: SykmeldingFragment[],
): { text: string; time: 'past' | 'present' | 'future' } {
    const now = new Date();
    const periods = sykmeldinger.flatMap((it) => it.perioder).sort(periodByDateAsc);
    const firstPeriod = periods[0];
    const lastPeriod = periods[periods.length - 1];
    const earliestFom = parseISO(periods[0].fom);
    const latestTom = parseISO(periods[periods.length - 1].tom);
    const isNowOutsideExtremities = !isWithinInterval(now, { start: earliestFom, end: latestTom });

    if (isNowOutsideExtremities) {
        if (isFuture(earliestFom)) {
            return {
                text: formatPeriodTextNowOrFuture(firstPeriod, 'fra'),
                time: 'future',
            };
        } else if (isPast(latestTom)) {
            return {
                text: `Friskmeldt ${formatDate(lastPeriod.tom)}`,
                time: 'past',
            };
        }
    }

    const currentPeriod = periods.find((period) =>
        isWithinInterval(now, { start: parseISO(period.fom), end: parseISO(period.tom) }),
    );

    if (currentPeriod) {
        return { text: formatPeriodTextNowOrFuture(currentPeriod, 'til'), time: 'present' };
    } else {
        const nearestPeriod = periods.reduce(toNearest(now));

        return { text: formatPeriodTextNowOrFuture(nearestPeriod, 'fra'), time: 'future' };
    }
}

function formatPeriodTextNowOrFuture(period: SykmeldingPeriodeFragment, type: 'fra' | 'til'): string {
    const date = formatDate(type === 'fra' ? period.fom : period.tom);
    const toFromDateString = `${type} ${date}`;
    switch (period.__typename) {
        case 'AktivitetIkkeMulig':
            return `100% sykmeldt ${toFromDateString}`;
        case 'Gradert':
            return `${period.grad}% sykmeldt ${toFromDateString}`;
        case 'Behandlingsdager':
            return `${period.behandlingsdager} behandlingsdag${
                period.behandlingsdager > 1 ? 'er' : ''
            } ${toFromDateString}`;
        case 'Avventende':
            return `Avventende sykmelding ${toFromDateString}`;
        case 'Reisetilskudd':
            return `Reisetilskudd ${toFromDateString}`;
    }
}

function toNearest(now: Date) {
    return (previous: SykmeldingPeriodeFragment, current: SykmeldingPeriodeFragment): SykmeldingPeriodeFragment => {
        const currentFom = toDate(current.fom);
        const previousFom = toDate(previous.fom);

        if (isAfter(previousFom, now)) return previous;
        if (isAfter(currentFom, now) && isAfter(currentFom, previousFom)) return current;
        else return previous;
    };
}

export function getEarliestFom(sykmelding: SykmeldingFragment): string {
    return formatISO(min(sykmelding.perioder.map((periode) => parseISO(periode.fom))));
}

export function getLatestTom(sykmelding: SykmeldingFragment): string {
    return formatISO(max(sykmelding.perioder.map((periode) => parseISO(periode.tom))));
}

/**
 * Used by reduce to get the latest tom date
 */
export const toLatestTom = (
    previousValue: SykmeldingPeriodeFragment,
    currentValue: SykmeldingPeriodeFragment,
): SykmeldingPeriodeFragment =>
    isAfter(toDate(previousValue.tom), toDate(currentValue.tom)) ? previousValue : currentValue;

import { startOfDay, formatDistanceToNowStrict, isAfter, isFuture, isPast, isWithinInterval, parseISO } from 'date-fns';
import { nb } from 'date-fns/locale';

import { SykmeldingFragment, SykmeldingPeriodeFragment } from '../graphql/queries/graphql.generated';
import { periodByDate } from '../components/sykmeldingpanel/sykmeldingperiode/sykmeldigPeriodeUtils';

import { diffInDays, formatDate, formatDateRange, toDate } from './dateUtils';

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

    if (isFuture(fom)) {
        return `Starter om ${formatDistanceToNowStrict(fom, { locale: nb })}`;
    } else if (isWithinInterval(startOfDay(new Date()), { start: fom, end: tom })) {
        return `${formatDistanceToNowStrict(tom, { locale: nb, unit: 'day' })} gjenstår`;
    } else {
        return `Ferdig`;
    }
}

export function createPeriodeKey(periode: SykmeldingPeriodeFragment): string {
    return `${periode.fom}-${periode.tom}`;
}

export function formatPeriodsRelative(
    name: string,
    sykmeldinger: SykmeldingFragment[],
    includeName: boolean,
): { text: string; time: 'past' | 'present' | 'future' } {
    const firstName = name.split(' ')[0];
    const now = new Date();
    const periods = sykmeldinger.flatMap((it) => it.perioder).sort(periodByDate);
    const firstPeriod = periods[0];
    const lastPeriod = periods[periods.length - 1];
    const earliestFom = parseISO(periods[0].fom);
    const latestTom = parseISO(periods[periods.length - 1].tom);
    const isNowOutsideExtremities = !isWithinInterval(now, { start: earliestFom, end: latestTom });

    if (isNowOutsideExtremities) {
        if (isFuture(earliestFom)) {
            return { text: formatPeriodTextNowOrFuture(firstPeriod, 'fra', includeName, firstName), time: 'future' };
        } else if (isPast(latestTom)) {
            return includeName
                ? {
                      text: `${firstName} var sist sykmeldt ${formatDateRange(lastPeriod.fom, lastPeriod.tom)}`,
                      time: 'past',
                  }
                : {
                      text: `Sist sykmeldt ${formatDateRange(lastPeriod.fom, lastPeriod.tom)}`,
                      time: 'past',
                  };
        }
    }

    const currentPeriod = periods.find((period) =>
        isWithinInterval(now, { start: parseISO(period.fom), end: parseISO(period.tom) }),
    );

    if (currentPeriod) {
        return { text: formatPeriodTextNowOrFuture(currentPeriod, 'til', includeName, firstName), time: 'present' };
    } else {
        const nearestPeriod = periods.reduce(toNearest(now));

        return { text: formatPeriodTextNowOrFuture(nearestPeriod, 'fra', includeName, firstName), time: 'future' };
    }
}

function formatPeriodTextNowOrFuture(
    period: SykmeldingPeriodeFragment,
    type: 'fra' | 'til',
    includeName: boolean,
    firstName: string,
): string {
    const date = formatDate(type === 'fra' ? period.fom : period.tom);
    const toFromDateString = `${type} ${date}`;
    switch (period.__typename) {
        case 'AktivitetIkkeMulig':
            return includeName
                ? `${firstName} er 100% sykmeldt ${toFromDateString}`
                : `100% sykmeldt ${toFromDateString}`;
        case 'Gradert':
            return includeName
                ? `${firstName} er ${period.grad}% sykmeldt ${toFromDateString}`
                : `${period.grad}% sykmeldt ${toFromDateString}`;
        case 'Behandlingsdager':
            return includeName
                ? `${firstName} har ${period.behandlingsdager} behandlingsdag${
                      period.behandlingsdager > 1 ? 'er' : ''
                  } ${toFromDateString}`
                : `${period.behandlingsdager} behandlingsdag${
                      period.behandlingsdager > 1 ? 'er' : ''
                  } ${toFromDateString}`;
        case 'Avventende':
            return includeName
                ? `${firstName} har avventende sykmelding ${toFromDateString}`
                : `Avventende sykmelding ${toFromDateString}`;
        case 'Reisetilskudd':
            return includeName
                ? `${firstName} har reisetilskudd ${toFromDateString}`
                : `Reisetilskudd ${toFromDateString}`;
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

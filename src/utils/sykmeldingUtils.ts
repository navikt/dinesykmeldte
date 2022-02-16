import { isFuture, parseISO, formatDistanceToNowStrict, isWithinInterval } from 'date-fns';

import { SykmeldingPeriodeFragment } from '../graphql/queries/react-query.generated';

import { diffInDays } from './dateUtils';

export function getSykmeldingPeriodDescription(period: SykmeldingPeriodeFragment): string {
    const periodLength = diffInDays(period.fom, period.tom);

    switch (period.__typename) {
        case 'AktivitetIkkeMulig':
            return `100% sykmeldt i ${periodLength} dag${periodLength > 1 ? 'er' : ''}`;
        case 'Gradert':
            return `${period.grad}% sykmeldt i ${periodLength} dag${periodLength > 1 ? 'er' : ''}`;
        case 'Behandlingsdager':
            return `${period.behandlingsdager} behandlingsdag${
                period.behandlingsdager && period.behandlingsdager > 1 ? 'er' : ''
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
        return `Starter om ${formatDistanceToNowStrict(fom)}`;
    } else if (isWithinInterval(new Date(), { start: fom, end: tom })) {
        return `${formatDistanceToNowStrict(fom)} gjenstår`;
    } else {
        return `Ferdig`;
    }
}

export function createPeriodeKey(periode: SykmeldingPeriodeFragment): string {
    return `${periode.fom}-${periode.tom}`;
}

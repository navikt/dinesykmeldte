import { compareAsc, isAfter, parseISO } from 'date-fns';

import {
    PreviewSykmeldingFragment,
    PreviewSykmeldtFragment,
    SykmeldingFragment,
    SykmeldingPeriodeFragment,
} from '../graphql/queries/react-query.generated';

import { isPreviewSoknadNotification } from './soknadUtils';
import { notNull } from './tsUtils';

export function formatNamePossessive(sykmeldt: PreviewSykmeldtFragment | null, postfix: string): string {
    if (sykmeldt?.navn) {
        return `${sykmeldt.navn}s ${postfix}`;
    } else {
        return `Sykmeldtes ${postfix}`;
    }
}

export function formatNameSubjective(navn: string | null | undefined): string {
    if (navn) {
        return `${navn}`;
    } else {
        return `Den sykmeldte`;
    }
}

/**
 * Used by reduce to get the latest tom date
 */
const toLatestTom = (
    previousValue: PreviewSykmeldingFragment,
    currentValue: PreviewSykmeldingFragment,
): PreviewSykmeldingFragment =>
    isAfter(parseISO(previousValue.tom), parseISO(currentValue.tom)) ? previousValue : currentValue;

export function sortByDate(a: PreviewSykmeldtFragment, b: PreviewSykmeldtFragment): number {
    const latestA = a.previewSykmeldinger.reduce(toLatestTom);
    const latestB = b.previewSykmeldinger.reduce(toLatestTom);

    return compareAsc(parseISO(latestA.tom), parseISO(latestB.tom));
}

export function sortByName(a: PreviewSykmeldtFragment, b: PreviewSykmeldtFragment): number {
    return a.navn.localeCompare(b.navn);
}

export function hasNotifications(sykmeldt: PreviewSykmeldtFragment): boolean {
    return (
        sykmeldt.previewSykmeldinger?.some((it) => !it.lest) ||
        sykmeldt.previewSoknader.some((it) => isPreviewSoknadNotification(it))
    );
}

export function getLatestPeriod(sykmeldinger: (SykmeldingFragment | null)[]): SykmeldingPeriodeFragment | null {
    return [...sykmeldinger]
        .filter(notNull)
        .flatMap((it) => it.perioder)
        .reduce<SykmeldingPeriodeFragment | null>((previousValue, currentValue) => {
            if (currentValue == null || previousValue == null) return previousValue;
            return isAfter(parseISO(previousValue.tom), parseISO(currentValue.tom)) ? previousValue : currentValue;
        }, null);
}

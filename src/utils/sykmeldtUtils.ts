import { isAfter, compareAsc, parseISO } from 'date-fns';

import { PreviewSykmeldingFragment, PreviewSykmeldtFragment } from '../graphql/queries/react-query.generated';

import { isPreviewSoknadNotification } from './soknadUtils';

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
        return `den sykmeldte`;
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

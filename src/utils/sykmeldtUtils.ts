import { compareAsc, isAfter } from 'date-fns';

import { PreviewSykmeldingFragment, PreviewSykmeldtFragment } from '../graphql/queries/graphql.generated';

import { isPreviewSoknadNotification } from './soknadUtils';
import { toDate } from './dateUtils';

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
    isAfter(toDate(previousValue.tom), toDate(currentValue.tom)) ? previousValue : currentValue;

export function sortByDate(a: PreviewSykmeldtFragment, b: PreviewSykmeldtFragment): number {
    const latestA = a.previewSykmeldinger.reduce(toLatestTom);
    const latestB = b.previewSykmeldinger.reduce(toLatestTom);

    return compareAsc(toDate(latestA.tom), toDate(latestB.tom));
}

export function sortByName(a: PreviewSykmeldtFragment, b: PreviewSykmeldtFragment): number {
    return a.navn.localeCompare(b.navn);
}

export function hasNotifications(sykmeldt: PreviewSykmeldtFragment): boolean {
    return (
        sykmeldt.previewSykmeldinger.some((it) => !it.lest) ||
        sykmeldt.previewSoknader.some((it) => isPreviewSoknadNotification(it)) ||
        sykmeldt.dialogmoter.length > 0
    );
}

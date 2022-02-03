import { formatISO, max, min, parseISO } from 'date-fns';

import { PreviewSykmelding, Sykmelding } from '../../resolvers.generated';

function getLatestTom(sykmelding: Sykmelding): string {
    return formatISO(max(sykmelding.perioder.map((periode) => parseISO(periode.tom))));
}

export function getEarliestFom(fomToms: { fom: string; tom: string }[]): string {
    return formatISO(min(fomToms.map((periode) => parseISO(periode.fom))));
}

export function getEarliestFomInSykmeldings(sykmeldinger: Sykmelding[]): string {
    const foms = sykmeldinger.map((it) => getEarliestFom(it.perioder));
    return formatISO(min(foms.map((fom) => parseISO(fom))));
}

export function createPreviewSykmeldingFromSykmelding(sykmelding: Sykmelding): PreviewSykmelding {
    return {
        ...sykmelding,
        __typename: 'PreviewSykmelding',
        fom: getEarliestFom(sykmelding.perioder),
        tom: getLatestTom(sykmelding),
        type: 'TODO',
    };
}

type Entries<T> = {
    [K in keyof T]: [K, T[K]];
}[keyof T][];

export function entries<T>(obj: T): Entries<T> {
    return Object.entries(obj) as unknown as Entries<T>;
}

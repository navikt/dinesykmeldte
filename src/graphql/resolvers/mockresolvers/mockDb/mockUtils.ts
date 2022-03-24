import { formatISO, min, parseISO } from 'date-fns';

import { Periode, Sykmelding } from '../../resolvers.generated';

export function getEarliestFom(perioder: Periode[]): string {
    return formatISO(min(perioder.map((periode) => parseISO(periode.fom))));
}

export function getEarliestFomInSykmeldings(sykmeldinger: Sykmelding[]): string {
    const foms = sykmeldinger.map((it) => getEarliestFom(it.perioder));
    return formatISO(min(foms.map((fom) => parseISO(fom))));
}

type Entries<T> = {
    [K in keyof T]: [K, T[K]];
}[keyof T][];

export function entries<T>(obj: T): Entries<T> {
    return Object.entries(obj) as unknown as Entries<T>;
}

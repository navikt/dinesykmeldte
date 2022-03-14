import { compareAsc, parseISO } from 'date-fns';

import {
    ArbeidsrelatertArsakEnum,
    FomTom,
    SykmeldingPeriodeFragment,
} from '../../../graphql/queries/graphql.generated';
import { formatDateRange } from '../../../utils/dateUtils';

export function getPeriodeTitle(periode: SykmeldingPeriodeFragment): string {
    switch (periode.__typename) {
        case 'Avventende':
            return 'Avventende sykmelding';
        case 'AktivitetIkkeMulig':
            return 'Pasienten kan ikke være i arbeid (100% sykmelding)';
        case 'Gradert':
            return `${periode.grad}% sykmelding`;
        case 'Reisetilskudd':
            return 'Reisetilskudd';
        case 'Behandlingsdager':
            return 'Behandlingsdager';
    }
}

export function getPeriodeDateRange(periode: FomTom): string {
    return formatDateRange(periode.fom, periode.tom);
}

export function getArbeidsrelatertArsakText(arsak: ArbeidsrelatertArsakEnum): string {
    switch (arsak) {
        case ArbeidsrelatertArsakEnum.ManglendeTilrettelegging:
            return 'Manglende tilrettelegging på arbeidsplassen';
        case ArbeidsrelatertArsakEnum.Annet:
            return 'Annen årsak';
    }
}

export function periodByDate(a: SykmeldingPeriodeFragment, b: SykmeldingPeriodeFragment): number {
    return compareAsc(parseISO(a.tom), parseISO(b.tom));
}

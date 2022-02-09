import { add, parseISO } from 'date-fns';

import { PeriodeEnum, PreviewSoknadFragment, SoknadperiodeFragment } from '../graphql/queries/react-query.generated';

import { diffInDays, formatDate } from './dateUtils';

export function isPreviewSoknadNotification(soknad: PreviewSoknadFragment): boolean {
    switch (soknad.__typename) {
        case 'PreviewNySoknad':
            return soknad.varsel;
        case 'PreviewSendtSoknad':
            return !soknad.lest;
        case 'PreviewFremtidigSoknad':
        case 'PreviewKorrigertSoknad':
            return false;
    }
}

export function getSoknadActivationDate(tom: string): string {
    return formatDate(add(parseISO(tom), { days: 1 }));
}

export function getSoknadSykmeldingPeriodDescription(period: SoknadperiodeFragment): string {
    const periodLength = diffInDays(period.fom, period.tom);

    switch (period.sykmeldingstype) {
        case PeriodeEnum.AktivitetIkkeMulig:
            return `100% sykmeldt i ${periodLength} dag${periodLength > 1 ? 'er' : ''}`;
        case PeriodeEnum.Gradert:
            if (!period.sykmeldingsgrad) throw new Error('Soknadsperiode of type Gradert without grad');
            return `${period.sykmeldingsgrad}% sykmeldt i ${periodLength} dag${periodLength > 1 ? 'er' : ''}`;
        case PeriodeEnum.Behandlingsdager:
            // TODO hvordan skal denne formatteres uten behandlingsdager?
            return `Sykmeldt med behandlingsdager`;
        case PeriodeEnum.Avventende:
            return `Avventende sykmelding i ${periodLength} dag${periodLength > 1 ? 'er' : ''}`;
        case PeriodeEnum.Reisetilskudd:
            return `Reisetilskudd i ${periodLength} dag${periodLength > 1 ? 'er' : ''}`;
    }
}

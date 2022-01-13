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

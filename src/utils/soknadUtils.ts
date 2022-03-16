import { add, parseISO } from 'date-fns';

import {
    PeriodeEnum,
    PreviewSoknadFragment,
    SoknadperiodeFragment,
    SoknadSporsmalFragment,
    SporsmalTagEnum,
    SoknadSporsmalSvartypeEnum,
} from '../graphql/queries/graphql.generated';

import { diffInDays, formatDate } from './dateUtils';

export function isPreviewSoknadNotification(soknad: PreviewSoknadFragment): boolean {
    switch (soknad.__typename) {
        case 'PreviewNySoknad':
            return soknad.varsel;
        case 'PreviewSendtSoknad':
        case 'PreviewKorrigertSoknad':
            return !soknad.lest;
        case 'PreviewFremtidigSoknad':
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

export function getSoknadTallLabel(sporsmal: SoknadSporsmalFragment): string {
    switch (sporsmal.svartype) {
        case SoknadSporsmalSvartypeEnum.Prosent:
            return 'prosent';
        case SoknadSporsmalSvartypeEnum.Timer:
            return 'timer totalt';
        case SoknadSporsmalSvartypeEnum.Belop:
            return 'kr';
        case SoknadSporsmalSvartypeEnum.Kilometer:
            return 'km';
        default:
            return '';
    }
}

export function filterSoknadSporsmalByTag(sporsmal: SoknadSporsmalFragment[]): SoknadSporsmalFragment[] {
    return sporsmal.filter((sporsmal) => {
        switch (sporsmal.tag) {
            case SporsmalTagEnum.VaerKlarOverAt:
            case SporsmalTagEnum.BekreftOpplysningerUtlandInfo:
            case SporsmalTagEnum.IkkeSoktUtenlandsoppholdInformasjon:
                return false;
            default:
                return true;
        }
    });
}

import { add, compareDesc, parseISO } from 'date-fns'

import {
    PeriodeEnum,
    PreviewSoknadFragment,
    SoknadperiodeFragment,
    SoknadSporsmalFragment,
    SoknadSporsmalSvartypeEnum,
    SporsmalTagEnum,
} from '../graphql/queries/graphql.generated'

import { formatDatePeriod } from './dateUtils'
import { diffInDays, toDate } from './dateUtils'

export function isPreviewSoknadNotifying(soknad: PreviewSoknadFragment): boolean {
    switch (soknad.__typename) {
        case 'PreviewSendtSoknad':
            return !soknad.lest
        case 'PreviewNySoknad':
            if (soknad.ikkeSendtSoknadVarsel) {
                return !soknad.lest
            }
            return false
        case 'PreviewFremtidigSoknad':
            return false
    }
}

export function getSoknadActivationDate(tom: string): Date {
    return add(parseISO(tom), { days: 1 })
}

export function getSoknadSykmeldingPeriodDescription(period: SoknadperiodeFragment): string {
    const periodLength = diffInDays(period.fom, period.tom)

    switch (period.sykmeldingstype) {
        case PeriodeEnum.AktivitetIkkeMulig:
            return `100% sykmeldt i ${periodLength} dag${periodLength > 1 ? 'er' : ''}`
        case PeriodeEnum.Gradert:
            if (!period.sykmeldingsgrad) throw new Error('Soknadsperiode of type Gradert without grad')
            return `${period.sykmeldingsgrad}% sykmeldt i ${periodLength} dag${periodLength > 1 ? 'er' : ''}`
        case PeriodeEnum.Behandlingsdager:
            // TODO hvordan skal denne formatteres uten behandlingsdager?
            return `Sykmeldt med behandlingsdager`
        case PeriodeEnum.Avventende:
            return `Avventende sykmelding i ${periodLength} dag${periodLength > 1 ? 'er' : ''}`
        case PeriodeEnum.Reisetilskudd:
            return `Reisetilskudd i ${periodLength} dag${periodLength > 1 ? 'er' : ''}`
    }
}

export function getSoknadSykmeldingPeriod(period: SoknadperiodeFragment): string {
    const datePeriod = formatDatePeriod(period.fom, period.tom)
    switch (period.sykmeldingstype) {
        case PeriodeEnum.AktivitetIkkeMulig:
            return `100% sykmeldt ${datePeriod}`
        case PeriodeEnum.Gradert:
            return `${period.sykmeldingsgrad}% sykmeldt ${datePeriod}`
        case PeriodeEnum.Behandlingsdager:
            // TODO hvordan skal denne formatteres uten behandlingsdager?
            return `Sykmeldt med behandlingsdager`
        case PeriodeEnum.Avventende:
            return `Avventende sykmelding ${datePeriod}`
        case PeriodeEnum.Reisetilskudd:
            return `Reisetilskudd ${datePeriod}`
    }
}

export function getSoknadTallLabel(sporsmal: SoknadSporsmalFragment): string | null {
    switch (sporsmal.svartype) {
        case SoknadSporsmalSvartypeEnum.Prosent:
            return 'prosent'
        case SoknadSporsmalSvartypeEnum.Timer:
            return 'timer totalt'
        case SoknadSporsmalSvartypeEnum.Belop:
            return 'kr'
        case SoknadSporsmalSvartypeEnum.Kilometer:
            return 'km'
        default:
            return null
    }
}

export function soknadByDateDesc(a: PreviewSoknadFragment, b: PreviewSoknadFragment): number {
    return compareDesc(toDate(a.tom), toDate(b.tom))
}

export function shouldSporsmalVariantShow(sporsmal: SoknadSporsmalFragment): boolean {
    switch (sporsmal.tag) {
        case SporsmalTagEnum.Ansvarserklaring:
        case SporsmalTagEnum.BekreftOpplysninger:
            return false
        default:
            return true
    }
}

export function previewNySoknaderRead(soknader: PreviewSoknadFragment[]): PreviewSoknadFragment[] {
    const previewNySoknad = soknader.filter(
        (it) => it.__typename === 'PreviewNySoknad' && it.ikkeSendtSoknadVarsel && it.lest,
    )

    return previewNySoknad
}

export function previewNySoknaderUnread(soknader: PreviewSoknadFragment[]): PreviewSoknadFragment[] {
    const previewNySoknad = soknader.filter(
        (it) => it.__typename === 'PreviewNySoknad' && it.ikkeSendtSoknadVarsel && !it.lest,
    )

    return previewNySoknad
}

export function previewSoknadUnreadCount(soknader: PreviewSoknadFragment[]): {
    sendtSoknadCount: number
    nySoknadCount: number
} {
    const sendtSoknadCount = soknader.filter((it) => it.__typename === 'PreviewSendtSoknad' && !it.lest).length
    const nySoknadCount = previewNySoknaderUnread(soknader).length

    return { sendtSoknadCount, nySoknadCount }
}

export function getSoknadNotifyDescription(soknader: PreviewSoknadFragment[]): string[] | null {
    const { sendtSoknadCount, nySoknadCount } = previewSoknadUnreadCount(soknader)
    if (soknader.length === 0) return null

    const sendtSoknadTekst = sendtSoknadCount === 1 ? '1 sendt søknad' : `${sendtSoknadCount} sendte søknader`
    const nySoknadTekst = nySoknadCount === 1 ? 'Vi mangler 1 søknad' : `Vi mangler ${nySoknadCount} søknader`

    if (sendtSoknadCount === 0) return [nySoknadTekst]
    if (nySoknadCount === 0) return [sendtSoknadTekst]

    return [sendtSoknadTekst, nySoknadTekst]
}

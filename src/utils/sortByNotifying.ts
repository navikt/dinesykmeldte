import { compareAsc, compareDesc, isAfter } from 'date-fns'
import { logger } from '@navikt/next-logger'

import {
    SykmeldingFragment,
    PreviewSykmeldtFragment,
    PreviewSoknadFragment,
    Dialogmote,
    Aktivitetsvarsel,
    Oppfolgingsplan,
} from '../graphql/queries/graphql.generated'

import { toDate } from './dateUtils'

interface DateAndText {
    date: Date | string
    text: string
}
interface NotifyingDates {
    sykmeldt: PreviewSykmeldtFragment
    datesAndText: DateAndText[]
}

export interface SykmeldteWithLatestNotifyingDate {
    sykmeldt: PreviewSykmeldtFragment
    latestDateAndText: DateAndText
}

function toDateAndText(date: string, text: string): DateAndText {
    return {
        date: date,
        text: text,
    }
}

function findAllNotifyingDates(sykmeldte: PreviewSykmeldtFragment[]): NotifyingDates[] {
    const sykmeldteWithNotifyingDatesAndText = sykmeldte.map((sykmeldt) => {
        const sykmeldingDates = sykmeldt.sykmeldinger.map((sykmelding: SykmeldingFragment): DateAndText => {
            if (!sykmelding.lest && sykmelding.sendtTilArbeidsgiverDato) {
                return toDateAndText(sykmelding.sendtTilArbeidsgiverDato, 'Ulest sykmelding')
            }
            return toDateAndText('', '')
        })
        const soknaderDates = sykmeldt.previewSoknader.map((soknad: PreviewSoknadFragment): DateAndText => {
            if (
                soknad.__typename === 'PreviewNySoknad' &&
                soknad.ikkeSendtSoknadVarsel &&
                soknad.ikkeSendtSoknadVarsletDato
            ) {
                return toDateAndText(soknad.ikkeSendtSoknadVarsletDato, 'Mangler søknad')
            }
            if (soknad.__typename === 'PreviewSendtSoknad' && !soknad.lest && soknad.sendtDato) {
                return toDateAndText(soknad.sendtDato, 'Sendt søknad')
            }
            return toDateAndText('', '')
        })
        const aktivitetsvarslDates = sykmeldt.aktivitetsvarsler.map(
            (aktivitetsvarsl: Aktivitetsvarsel): DateAndText => {
                return !aktivitetsvarsl.lest && aktivitetsvarsl.mottatt
                    ? toDateAndText(aktivitetsvarsl.mottatt, 'Påminnelse om aktivitet')
                    : toDateAndText('', '')
            },
        )
        const dialogmoteDates = sykmeldt.dialogmoter.map((dialogmote: Dialogmote): DateAndText => {
            return dialogmote.mottatt
                ? toDateAndText(dialogmote.mottatt, dialogmote.tekst ?? 'Dialogmøte')
                : toDateAndText('', '')
        })
        const oppfolgingsplaneDates = sykmeldt.oppfolgingsplaner.map(
            (oppfolgingsplan: Oppfolgingsplan): DateAndText => {
                return oppfolgingsplan.mottatt
                    ? toDateAndText(oppfolgingsplan.mottatt, oppfolgingsplan.tekst ?? 'Oppfølgingsplan')
                    : toDateAndText('', '')
            },
        )

        const dateList = sykmeldingDates
            .concat(soknaderDates, aktivitetsvarslDates, dialogmoteDates, oppfolgingsplaneDates)
            .filter((it) => it.date !== '')

        return {
            sykmeldt: sykmeldt,
            datesAndText: dateList,
        }
    })

    return sykmeldteWithNotifyingDatesAndText
}

function sykmeldtWithLatestDate(sykmeldteDatesAndText: NotifyingDates[]): SykmeldteWithLatestNotifyingDate[] {
    return sykmeldteDatesAndText.map((sykmeldt) => {
        // Temporary sanity check to see if we can find the cause of the bug
        if (sykmeldt.datesAndText.length === 0) {
            logger.error(
                `No notifying dates found for sykmeldt ${sykmeldt.sykmeldt.narmestelederId}, this should not happen`,
            )

            return {
                sykmeldt: sykmeldt.sykmeldt,
                latestDateAndText: toDateAndText('', ''),
            }
        }

        const latestDateAndText = sykmeldt.datesAndText.reduce(
            (previousValue: DateAndText, currentValue: DateAndText) => {
                return isAfter(toDate(previousValue.date), toDate(currentValue.date)) ? previousValue : currentValue
            },
        )
        return {
            sykmeldt: sykmeldt.sykmeldt,
            latestDateAndText: latestDateAndText,
        }
    })
}

function sortSykmeldteByLatestDate(
    sykmeldteWithLatestDate: SykmeldteWithLatestNotifyingDate[],
): PreviewSykmeldtFragment[] {
    return sykmeldteWithLatestDate
        .sort((a: SykmeldteWithLatestNotifyingDate, b: SykmeldteWithLatestNotifyingDate) => {
            return compareDesc(toDate(a.latestDateAndText.date), toDate(b.latestDateAndText.date))
        })
        .map((it) => it.sykmeldt)
}

function sortSykmeldteByOldestDate(
    sykmeldteWithLatestDate: SykmeldteWithLatestNotifyingDate[],
): PreviewSykmeldtFragment[] {
    return sykmeldteWithLatestDate
        .sort((a: SykmeldteWithLatestNotifyingDate, b: SykmeldteWithLatestNotifyingDate) => {
            return compareAsc(toDate(a.latestDateAndText.date), toDate(b.latestDateAndText.date))
        })
        .map((it) => it.sykmeldt)
}

export function sortedByNotifyingDates(
    sykmeldte: PreviewSykmeldtFragment[],
    sortBy: string,
): PreviewSykmeldtFragment[] {
    const notifyingDates = findAllNotifyingDates(sykmeldte)
    const latestDate: SykmeldteWithLatestNotifyingDate[] = sykmeldtWithLatestDate(notifyingDates)
    return sortBy === 'latest' ? sortSykmeldteByLatestDate(latestDate) : sortSykmeldteByOldestDate(latestDate)
}

export function getLatestNotifyingDates(sykmeldte: PreviewSykmeldtFragment[]): SykmeldteWithLatestNotifyingDate[] {
    const notifyingDates = findAllNotifyingDates(sykmeldte)
    return sykmeldtWithLatestDate(notifyingDates).map((it) => {
        return {
            sykmeldt: it.sykmeldt,
            latestDateAndText: it.latestDateAndText,
        }
    })
}

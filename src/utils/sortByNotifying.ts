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
import { notNull } from './tsUtils'
import { isAktivitetsvarselNotifying, isSykmeldingNotifying } from './sykmeldtUtils'
import { isPreviewSoknadNotifying } from './soknadUtils'

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
        const sykmeldingDates = sykmeldt.sykmeldinger
            .filter(isSykmeldingNotifying)
            .map((sykmelding: SykmeldingFragment): DateAndText => {
                return toDateAndText(
                    sykmelding.sendtTilArbeidsgiverDato ??
                        // TODO: dette er sikkert feil, må fiksesi backend????
                        sykmelding.behandletTidspunkt,
                    'Ulest sykmelding',
                )
            })
        const soknaderDates = sykmeldt.previewSoknader
            .filter(isPreviewSoknadNotifying)
            .map((soknad: PreviewSoknadFragment): DateAndText | null => {
                if (soknad.__typename === 'PreviewFremtidigSoknad') {
                    logger.error('PreviewFremtidigSoknad er aldri notifying, hvorfor er den her?')
                    return null
                }

                if (soknad.__typename === 'PreviewNySoknad') {
                    if (soknad.ikkeSendtSoknadVarsletDato == null) {
                        logger.error('Søknad har ikke ikkeSendtSoknadVarsletDato, dette skal ikke skje')
                        return null
                    }

                    return toDateAndText(soknad.ikkeSendtSoknadVarsletDato, 'Mangler søknad')
                }

                return toDateAndText(soknad.sendtDato, 'Sendt søknad')
            })
        const aktivitetsvarslDates = sykmeldt.aktivitetsvarsler
            .filter(isAktivitetsvarselNotifying)
            .map(
                (aktivitetsvarsl: Aktivitetsvarsel): DateAndText =>
                    toDateAndText(aktivitetsvarsl.mottatt, 'Påminnelse om aktivitet'),
            )
        const dialogmoteDates = sykmeldt.dialogmoter.map(
            (dialogmote: Dialogmote): DateAndText =>
                toDateAndText(dialogmote.mottatt, dialogmote.tekst ?? 'Dialogmøte'),
        )
        const oppfolgingsplaneDates = sykmeldt.oppfolgingsplaner.map(
            (oppfolgingsplan: Oppfolgingsplan): DateAndText =>
                toDateAndText(oppfolgingsplan.mottatt, oppfolgingsplan.tekst ?? 'Oppfølgingsplan'),
        )

        const dateList = sykmeldingDates.concat(
            soknaderDates.filter(notNull),
            aktivitetsvarslDates,
            dialogmoteDates,
            oppfolgingsplaneDates,
        )

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

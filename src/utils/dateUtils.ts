import {
    differenceInDays,
    format,
    formatISO,
    getDate,
    isSameMonth,
    isSameYear,
    parseISO,
    add,
    sub,
    Duration,
} from 'date-fns'
import { nb } from 'date-fns/locale'

export function toDate(date: string | Date): Date {
    return typeof date === 'string' ? parseISO(date) : date
}

export function formatDate(date: string | Date): string {
    return format(toDate(date), 'd. MMMM yyyy', { locale: nb })
}

export function formatDateTime(date: string | Date): string {
    return format(toDate(date), 'd. MMMM yyyy, HH:mm', { locale: nb })
}

export function formatDateNoYear(date: string | Date): string {
    return format(toDate(date), 'd. MMMM', { locale: nb })
}

export function formatMonthYear(date: string | Date): string {
    return format(toDate(date), 'MMMM yyyy', { locale: nb })
}

export function dateAdd(date: string | Date, duration: Duration): string {
    return toDateString(add(toDate(date), duration))
}

export function dateSub(date: string | Date, duration: Duration): string {
    return toDateString(sub(toDate(date), duration))
}

export function toDateString(date: Date): string {
    return formatISO(date, { representation: 'date' })
}

export function formatDatePeriod(fom: string | Date, tom: string | Date): string {
    const fomDate = toDate(fom)
    const tomDate = toDate(tom)

    if (isSameMonth(fomDate, tomDate)) {
        return `${getDate(fomDate)}. - ${formatDate(tomDate)}`
    } else if (isSameYear(fomDate, tomDate)) {
        return `${formatDateNoYear(fomDate)} - ${formatDate(tomDate)}`
    } else {
        return `${formatDate(fomDate)} - ${formatDate(tomDate)}`
    }
}

export function formatDateRange(fom: string, tom: string): string {
    return `${formatDate(fom)} - ${formatDate(tom)}`
}

export function diffInDays(fom: string, tom: string): number {
    return differenceInDays(parseISO(tom), parseISO(fom)) + 1
}

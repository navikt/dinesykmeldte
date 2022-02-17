import { differenceInDays, format, getDate, isSameMonth, isSameYear, parseISO } from 'date-fns';
import { nb } from 'date-fns/locale';

function toDate(date: string | Date): Date {
    return typeof date === 'string' ? parseISO(date) : date;
}

export function formatDate(date: string | Date): string {
    return format(toDate(date), 'd. MMMM yyyy', { locale: nb });
}

export function formatDateNoYear(date: string | Date): string {
    return format(toDate(date), 'd. MMMM', { locale: nb });
}

export function formatDatePeriod(fom: string | Date, tom: string | Date): string {
    const fomDate = toDate(fom);
    const tomDate = toDate(tom);

    if (isSameMonth(fomDate, tomDate)) {
        return `${getDate(fomDate)} - ${formatDate(tomDate)}`;
    } else if (isSameYear(fomDate, tomDate)) {
        return `${formatDateNoYear(fomDate)} - ${formatDate(tomDate)}`;
    } else {
        return `${formatDate(fomDate)} - ${formatDate(tomDate)}`;
    }
}

export function formatDateRange(fom: string, tom: string): string {
    return `${formatDate(fom)} - ${formatDate(tom)}`;
}

export function diffInDays(fom: string, tom: string): number {
    return differenceInDays(parseISO(tom), parseISO(fom)) + 1;
}

import { differenceInDays, format, parseISO } from 'date-fns';
import { nb } from 'date-fns/locale';

export function formatDate(date: string | Date): string {
    const input = typeof date === 'string' ? parseISO(date) : date;
    return format(input, 'd. MMMM yyyy', { locale: nb });
}

export function formatDateRange(fom: string, tom: string): string {
    return `${formatDate(fom)} - ${formatDate(tom)}`;
}

export function diffInDays(fom: string, tom: string): number {
    return differenceInDays(parseISO(tom), parseISO(fom)) + 1;
}

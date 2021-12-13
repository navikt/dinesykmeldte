import { format, parseISO } from 'date-fns';
import { nb } from 'date-fns/locale';

export function formatDate(date: string): string {
    return format(parseISO(date), 'd. MMMM yyyy', { locale: nb });
}

export function formatDateRange(fom: string, tom: string): string {
    return `${formatDate(fom)} - ${formatDate(tom)}`;
}

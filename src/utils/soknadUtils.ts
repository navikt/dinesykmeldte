import { add, parseISO } from 'date-fns';

import { PreviewSoknadFragment } from '../graphql/queries/react-query.generated';

import { formatDate } from './dateUtils';

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

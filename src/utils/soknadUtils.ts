import { PreviewSoknadFragment } from '../graphql/queries/react-query.generated';

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

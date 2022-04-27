import { Tag } from '@navikt/ds-react';
import { isPast } from 'date-fns';
import React from 'react';

import { PreviewSoknadFragment } from '../../../graphql/queries/graphql.generated';
import { getSoknadActivationDate } from '../../../utils/soknadUtils';
import { formatDate } from '../../../utils/dateUtils';

function SoknadTag({ soknad }: { soknad: PreviewSoknadFragment }): JSX.Element | null {
    switch (soknad.__typename) {
        case 'PreviewNySoknad':
            if (!soknad.ikkeSendtSoknadVarsel) return null;

            return (
                <Tag variant="info" size="small">
                    Ikke sendt
                </Tag>
            );
        case 'PreviewFremtidigSoknad': {
            const soknadActivationDate = getSoknadActivationDate(soknad.tom);
            if (isPast(soknadActivationDate)) return null;

            return (
                <Tag variant="info" size="small">
                    Aktiveres {formatDate(soknadActivationDate)}
                </Tag>
            );
        }
        case 'PreviewSendtSoknad':
            if (!soknad.korrigererSoknadId) return null;

            return (
                <Tag variant="info" size="small">
                    Korrigering
                </Tag>
            );
    }
}

export default SoknadTag;

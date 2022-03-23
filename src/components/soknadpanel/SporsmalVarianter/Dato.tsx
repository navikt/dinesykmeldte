import React from 'react';
import { BodyShort, Heading } from '@navikt/ds-react';

import { cleanId } from '../../../utils/stringUtils';
import { formatDate } from '../../../utils/dateUtils';
import { Dato } from '../../../shared/schema';

import SporsmalListItem from './shared/SporsmalListItem';
import SporsmalList from './shared/SporsmalList';
import SporsmalListItemNested from './shared/SporsmalListItemNested';

function Dato({ sporsmal }: { sporsmal: Dato }): JSX.Element | null {
    const listItemId = cleanId(sporsmal.id);

    return (
        <SporsmalListItem listItemId={listItemId}>
            <Heading id={listItemId} size="xsmall" level="4">
                {sporsmal.sporsmalstekst}
            </Heading>
            <SporsmalList>
                <SporsmalListItemNested>
                    <BodyShort size="small">{formatDate(sporsmal.dato)}</BodyShort>
                </SporsmalListItemNested>
            </SporsmalList>
        </SporsmalListItem>
    );
}

export default Dato;

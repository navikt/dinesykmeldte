import React from 'react';
import { BodyShort, Heading } from '@navikt/ds-react';

import { cleanId } from '../../../utils/stringUtils';
import { Fritekst } from '../../../shared/schema';

import SporsmalListItem from './shared/SporsmalListItem';

function Fritekst({ sporsmal }: { sporsmal: Fritekst }): JSX.Element | null {
    const listItemId = cleanId(sporsmal.id);

    return (
        <SporsmalListItem listItemId={listItemId}>
            <Heading id={listItemId} size="xsmall" level="4">
                {sporsmal.sporsmalstekst}
            </Heading>
            <BodyShort size="small">{sporsmal.svar}</BodyShort>
        </SporsmalListItem>
    );
}

export default Fritekst;

import React from 'react';
import { BodyShort, Heading } from '@navikt/ds-react';

import { cleanId } from '../../../utils/stringUtils';
import { getSoknadTallLabel } from '../../../utils/soknadUtils';
import { Tall } from '../../../shared/schema';

import SporsmalListItem from './shared/SporsmalListItem';
import SporsmalList from './shared/SporsmalList';
import SporsmalListItemNested from './shared/SporsmalListItemNested';

function Tall({ sporsmal }: { sporsmal: Tall }): JSX.Element | null {
    const listItemId = cleanId(sporsmal.id);
    const label = sporsmal.undertekst || getSoknadTallLabel(sporsmal);

    return (
        <SporsmalListItem listItemId={listItemId}>
            <Heading id={listItemId} size="xsmall" level="4">
                {sporsmal.sporsmalstekst}
            </Heading>
            <SporsmalList>
                <SporsmalListItemNested>
                    <BodyShort size="small">
                        {sporsmal.svar} {label}
                    </BodyShort>
                </SporsmalListItemNested>
            </SporsmalList>
        </SporsmalListItem>
    );
}

export default Tall;

import React from 'react';
import { BodyShort, Heading } from '@navikt/ds-react';

import { cleanId } from '../../../utils/stringUtils';

import { SporsmalVarianterProps } from './SporsmalVarianter';
import SporsmalListItem from './shared/SporsmalListItem';

function Fritekst({ sporsmal }: SporsmalVarianterProps): JSX.Element | null {
    if (!sporsmal.svar || !sporsmal.svar[0]) return null;

    const listItemId = cleanId(sporsmal.sporsmalstekst);

    return (
        <SporsmalListItem listItemId={listItemId}>
            <Heading id={listItemId} size="xsmall" level="4">
                {sporsmal.sporsmalstekst}
            </Heading>
            <BodyShort size="small">{sporsmal.svar[0].verdi}</BodyShort>
        </SporsmalListItem>
    );
}

export default Fritekst;

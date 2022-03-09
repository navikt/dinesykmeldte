import React from 'react';
import { BodyShort, Heading } from '@navikt/ds-react';

import { cleanId } from '../../../utils/stringUtils';
import { formatDate } from '../../../utils/dateUtils';

import { SporsmalVarianterProps } from './SporsmalVarianter';
import SporsmalListItem from './shared/SporsmalListItem';
import SporsmalList from './shared/SporsmalList';
import SporsmalListItemNested from './shared/SporsmalListItemNested';

function Dato({ sporsmal }: SporsmalVarianterProps): JSX.Element | null {
    const listItemId = cleanId(sporsmal.sporsmalstekst);

    if (!sporsmal.svar || sporsmal.svar.length === 0) return null;

    return (
        <SporsmalListItem listItemId={listItemId}>
            <Heading id={listItemId} size="xsmall" level="4">
                {sporsmal.sporsmalstekst}
            </Heading>
            <SporsmalList>
                {sporsmal.svar.map((svar, index) => {
                    return (
                        <SporsmalListItemNested listItemId={listItemId + index} key={listItemId + index}>
                            <BodyShort size="small">{svar?.verdi && formatDate(svar.verdi)}</BodyShort>
                        </SporsmalListItemNested>
                    );
                })}
            </SporsmalList>
        </SporsmalListItem>
    );
}

export default Dato;

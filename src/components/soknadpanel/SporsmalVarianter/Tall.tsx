import React from 'react';
import { BodyShort, Heading } from '@navikt/ds-react';

import { cleanId } from '../../../utils/stringUtils';
import { getSoknadTallLabel } from '../../../utils/soknadUtils';

import { SporsmalVarianterProps } from './SporsmalVarianter';
import SporsmalListItem from './shared/SporsmalListItem';
import SporsmalList from './shared/SporsmalList';
import SporsmalListItemNested from './shared/SporsmalListItemNested';

function Tall({ sporsmal }: SporsmalVarianterProps): JSX.Element | null {
    const listItemId = cleanId(sporsmal.sporsmalstekst);

    const label = sporsmal.undertekst || getSoknadTallLabel(sporsmal);

    if (!sporsmal.svar || !sporsmal.svar[0]) return null;

    return (
        <SporsmalListItem listItemId={listItemId}>
            <Heading id={listItemId} size="xsmall" level="4">
                {sporsmal.sporsmalstekst}
            </Heading>
            <SporsmalList>
                {sporsmal.svar.map((svar, index) => {
                    return (
                        <SporsmalListItemNested listItemId={listItemId + index} key={listItemId + index}>
                            <BodyShort id={listItemId + index} className="test" size="small">
                                {svar?.verdi} {label}
                            </BodyShort>
                        </SporsmalListItemNested>
                    );
                })}
            </SporsmalList>
        </SporsmalListItem>
    );
}

export default Tall;

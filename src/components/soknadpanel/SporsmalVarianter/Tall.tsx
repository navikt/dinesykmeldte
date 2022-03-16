import React from 'react';
import { BodyShort, Heading } from '@navikt/ds-react';

import { cleanId } from '../../../utils/stringUtils';
import { getSoknadTallLabel } from '../../../utils/soknadUtils';
import { notNull } from '../../../utils/tsUtils';

import { SporsmalVarianterProps } from './SporsmalVarianter';
import SporsmalListItem from './shared/SporsmalListItem';
import SporsmalList from './shared/SporsmalList';
import SporsmalListItemNested from './shared/SporsmalListItemNested';

function Tall({ sporsmal }: SporsmalVarianterProps): JSX.Element | null {
    if (!sporsmal.svar || !sporsmal.svar[0]) return null;

    const listItemId = cleanId(sporsmal.sporsmalstekst);
    const label = sporsmal.undertekst || getSoknadTallLabel(sporsmal);

    return (
        <SporsmalListItem listItemId={listItemId}>
            <Heading id={listItemId} size="xsmall" level="4">
                {sporsmal.sporsmalstekst}
            </Heading>
            <SporsmalList>
                {sporsmal.svar.filter(notNull).map((svar) => {
                    const svarId = cleanId(svar.verdi);
                    return (
                        <SporsmalListItemNested listItemId={svarId} key={svarId}>
                            <BodyShort id={svarId} size="small">
                                {svar.verdi} {label}
                            </BodyShort>
                        </SporsmalListItemNested>
                    );
                })}
            </SporsmalList>
        </SporsmalListItem>
    );
}

export default Tall;

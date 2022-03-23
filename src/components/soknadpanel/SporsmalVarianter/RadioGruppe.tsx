import React from 'react';
import { Heading } from '@navikt/ds-react';

import { cleanId } from '../../../utils/stringUtils';
import { RadioGruppe } from '../../../shared/schema';

import Undersporsmal from './Undersporsmal';
import SporsmalListItem from './shared/SporsmalListItem';

function RadioGruppe({ sporsmal }: { sporsmal: RadioGruppe }): JSX.Element | null {
    const listItemId = cleanId(sporsmal.id);
    const hasBesvartUnderspm = sporsmal.undersporsmal.length > 0;

    return (
        <SporsmalListItem listItemId={listItemId} noBorderAndSpacing={hasBesvartUnderspm}>
            <Heading id={listItemId} size="xsmall" level="4">
                {sporsmal.sporsmalstekst}
            </Heading>
            {/* TODO: mangler det noe "mellomtittel" her? */}
            {/*<CheckboxExplanation text={besvartUndersporsmal.sporsmalstekst} />*/}
            {hasBesvartUnderspm && <Undersporsmal sporsmalsliste={sporsmal.undersporsmal} />}
        </SporsmalListItem>
    );
}

export default RadioGruppe;

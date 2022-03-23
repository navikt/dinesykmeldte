import React from 'react';
import { Heading } from '@navikt/ds-react';

import { capitalizeFirstLetterOnly, cleanId } from '../../../utils/stringUtils';
import CheckboxExplanation from '../../shared/checkboxexplanation/CheckboxExplanation';
import { JaNei } from '../../../shared/schema';

import SporsmalListItem from './shared/SporsmalListItem';
import Undersporsmal from './Undersporsmal';

function JaEllerNei({ sporsmal }: { sporsmal: JaNei }): JSX.Element | null {
    const listItemId = cleanId(sporsmal.id);
    const hasUndersporsmal = sporsmal.undersporsmal.length > 0;

    return (
        <SporsmalListItem listItemId={listItemId} noBorderAndSpacing={hasUndersporsmal}>
            <Heading id={listItemId} size="xsmall" level="4">
                {sporsmal.sporsmalstekst}
            </Heading>
            <CheckboxExplanation text={capitalizeFirstLetterOnly(sporsmal.svar)} />
            {hasUndersporsmal && <Undersporsmal sporsmalsliste={sporsmal.undersporsmal} />}
        </SporsmalListItem>
    );
}

export default JaEllerNei;

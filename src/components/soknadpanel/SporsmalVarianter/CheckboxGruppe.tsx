import React from 'react';
import { Heading } from '@navikt/ds-react';

import { cleanId } from '../../../utils/stringUtils';
import { Checkboxgruppe } from '../../../shared/schema';

import Undersporsmal from './Undersporsmal';

function CheckboxGruppe({ sporsmal }: { sporsmal: Checkboxgruppe }): JSX.Element | null {
    const listItemId = cleanId(sporsmal.id);

    return (
        <li aria-labelledby={listItemId}>
            <Heading id={listItemId} size="xsmall" level="4">
                {sporsmal.sporsmalstekst}
            </Heading>
            <Undersporsmal sporsmalsliste={sporsmal.checkboxer} />
        </li>
    );
}

export default CheckboxGruppe;

import React from 'react';
import { Heading } from '@navikt/ds-react';

import { cleanId } from '../../../utils/stringUtils';
import { SoknadSporsmalFragment } from '../../../graphql/queries/graphql.generated';

import { SporsmalVarianterProps } from './SporsmalVarianter';
import Undersporsmal from './Undersporsmal';

function CheckboxGruppe({ sporsmal }: SporsmalVarianterProps): JSX.Element | null {
    const listItemId = cleanId(sporsmal.sporsmalstekst);
    const undersporsmal = sporsmal.undersporsmal as SoknadSporsmalFragment[];

    if (!undersporsmal || undersporsmal?.length === 0) return null;

    return (
        <li aria-labelledby={listItemId}>
            <Heading id={listItemId} size="xsmall" level="4">
                {sporsmal.sporsmalstekst}
            </Heading>
            <Undersporsmal sporsmalsliste={undersporsmal} />
        </li>
    );
}

export default CheckboxGruppe;

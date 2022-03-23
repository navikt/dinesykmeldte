import React from 'react';

import CheckboxExplanation from '../../shared/checkboxexplanation/CheckboxExplanation';
import { Checkbox } from '../../../shared/schema';

import SporsmalListItem from './shared/SporsmalListItem';
import Undersporsmal from './Undersporsmal';

function Checkbox({ sporsmal }: { sporsmal: Checkbox }): JSX.Element | null {
    const hasUndersporsmal = sporsmal.undersporsmal.length > 0;

    return (
        <SporsmalListItem noBorderAndSpacing={hasUndersporsmal}>
            {sporsmal.sporsmalstekst && <CheckboxExplanation text={sporsmal.sporsmalstekst} alignStart />}
            {hasUndersporsmal && <Undersporsmal sporsmalsliste={sporsmal.undersporsmal} />}
        </SporsmalListItem>
    );
}

export default Checkbox;

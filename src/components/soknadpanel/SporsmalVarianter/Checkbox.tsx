import React from 'react';

import CheckboxExplanation from '../../shared/checkboxexplanation/CheckboxExplanation';
import { SoknadSporsmalFragment } from '../../../graphql/queries/graphql.generated';

import { SporsmalVarianterProps, PossibleSvarEnum } from './SporsmalVarianter';
import SporsmalListItem from './shared/SporsmalListItem';
import Undersporsmal from './Undersporsmal';

function Checkbox({ sporsmal }: SporsmalVarianterProps): JSX.Element | null {
    const underspm = sporsmal.undersporsmal as SoknadSporsmalFragment[];
    const hasUndersporsmal = underspm.length > 0;

    if (sporsmal.svar && sporsmal.svar[0]?.verdi !== PossibleSvarEnum.CHECKED) return null;

    return (
        <SporsmalListItem noBorderAndSpacing={hasUndersporsmal}>
            <CheckboxExplanation text={sporsmal.sporsmalstekst} alignStart />
            {hasUndersporsmal && <Undersporsmal sporsmalsliste={underspm} />}
        </SporsmalListItem>
    );
}

export default Checkbox;

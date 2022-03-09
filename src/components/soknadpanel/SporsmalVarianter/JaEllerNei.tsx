import React from 'react';
import { Heading } from '@navikt/ds-react';

import { SoknadSporsmalFragment } from '../../../graphql/queries/graphql.generated';
import { capitalizeFirstLetterOnly, cleanId } from '../../../utils/stringUtils';
import CheckboxExplanation from '../../shared/checkboxexplanation/CheckboxExplanation';

import { SporsmalVarianterProps } from './SporsmalVarianter';
import SporsmalListItem from './shared/SporsmalListItem';
import Undersporsmal from './Undersporsmal';

const erUndersporsmalStilt = (sporsmal: SoknadSporsmalFragment): boolean => {
    if (sporsmal.svar && sporsmal.svar.length > 0 && sporsmal.kriterieForVisningAvUndersporsmal) {
        return sporsmal.svar.map((svar) => svar?.verdi).indexOf(sporsmal.kriterieForVisningAvUndersporsmal) > -1;
    }
    return false;
};

function JaEllerNei({ sporsmal }: SporsmalVarianterProps): JSX.Element | null {
    const listItemId = cleanId(sporsmal.sporsmalstekst);

    const undersporsmal = sporsmal.undersporsmal as SoknadSporsmalFragment[];

    if (!sporsmal.svar || !sporsmal.svar[0]) return null;

    return (
        <SporsmalListItem listItemId={listItemId} noBorderAndSpacing={erUndersporsmalStilt(sporsmal)}>
            <Heading id={listItemId} size="xsmall" level="4">
                {sporsmal.sporsmalstekst}
            </Heading>
            <CheckboxExplanation text={capitalizeFirstLetterOnly(sporsmal.svar[0].verdi)} />
            {erUndersporsmalStilt(sporsmal) && <Undersporsmal sporsmalsliste={undersporsmal} />}
        </SporsmalListItem>
    );
}

export default JaEllerNei;

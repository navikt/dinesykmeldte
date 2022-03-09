import React from 'react';
import { Heading } from '@navikt/ds-react';

import { SoknadSporsmalFragment, SoknadSporsmalSvartypeEnum } from '../../../graphql/queries/graphql.generated';
import CheckboxExplanation from '../../shared/checkboxexplanation/CheckboxExplanation';
import { cleanId } from '../../../utils/stringUtils';

import { SporsmalVarianterProps, PossibleSvarEnum } from './SporsmalVarianter';
import Undersporsmal from './Undersporsmal';
import SporsmalListItem from './shared/SporsmalListItem';

function RadioGruppe({ sporsmal }: SporsmalVarianterProps): JSX.Element | null {
    const listItemId = cleanId(sporsmal.sporsmalstekst);

    if (!sporsmal.undersporsmal || sporsmal.undersporsmal.length === 0) return null;

    const besvartUndersporsmal =
        sporsmal.undersporsmal &&
        sporsmal.undersporsmal.find((underspm) => {
            return underspm?.svar && underspm.svar[0] && underspm.svar[0].verdi === PossibleSvarEnum.CHECKED;
        });

    if (!besvartUndersporsmal) return null;

    const besvartUnderspm = besvartUndersporsmal.undersporsmal as SoknadSporsmalFragment[];
    const hasBesvartUnderspm = besvartUnderspm && besvartUnderspm.length > 0;

    return (
        <SporsmalListItem listItemId={listItemId} noBorderAndSpacing={hasBesvartUnderspm}>
            <Heading id={listItemId} size="xsmall" level="4">
                {sporsmal.sporsmalstekst}
            </Heading>
            {sporsmal.svartype === SoknadSporsmalSvartypeEnum.RadioGruppe && (
                <CheckboxExplanation text={besvartUndersporsmal.sporsmalstekst} />
            )}
            {hasBesvartUnderspm && <Undersporsmal sporsmalsliste={besvartUnderspm} />}
        </SporsmalListItem>
    );
}

export default RadioGruppe;

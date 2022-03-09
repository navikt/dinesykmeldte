import React from 'react';
import { BodyShort, Heading } from '@navikt/ds-react';

import { formatDate, formatDatePeriod } from '../../../utils/dateUtils';
import { cleanId } from '../../../utils/stringUtils';
import CheckboxExplanation from '../../shared/checkboxexplanation/CheckboxExplanation';
import { SoknadSporsmalSvarFragment } from '../../../graphql/queries/graphql.generated';

import { SporsmalVarianterProps } from './SporsmalVarianter';
import SporsmalListItem from './shared/SporsmalListItem';
import SporsmalList from './shared/SporsmalList';
import SporsmalListItemNested from './shared/SporsmalListItemNested';

const datoEllerIkkeTilBehandling = (svar: SoknadSporsmalSvarFragment): string => {
    if (svar.verdi === '' || svar.verdi === 'Ikke til behandling') {
        return 'Ikke til behandling';
    }
    return formatDate(svar.verdi);
};

function Behandlingsdager({ sporsmal }: SporsmalVarianterProps): JSX.Element | null {
    const listItemId = cleanId(sporsmal.sporsmalstekst);

    if (!sporsmal.undersporsmal || sporsmal.undersporsmal?.length === 0) return null;

    return (
        <SporsmalListItem listItemId={listItemId}>
            <Heading id={listItemId} size="xsmall" level="4">
                {sporsmal.sporsmalstekst}
            </Heading>
            <SporsmalList>
                {sporsmal.undersporsmal.map((underspm, index) => {
                    return (
                        <SporsmalListItemNested listItemId={listItemId + index} key={listItemId + index}>
                            {underspm?.min && underspm?.max && (
                                <BodyShort id={listItemId + index} size="small">
                                    {formatDatePeriod(underspm.min, underspm.max)}
                                </BodyShort>
                            )}
                            {underspm?.svar && underspm.svar[0] && (
                                <CheckboxExplanation text={datoEllerIkkeTilBehandling(underspm.svar[0])} />
                            )}
                        </SporsmalListItemNested>
                    );
                })}
            </SporsmalList>
        </SporsmalListItem>
    );
}

export default Behandlingsdager;

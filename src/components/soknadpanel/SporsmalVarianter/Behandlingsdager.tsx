import React from 'react';
import { BodyShort, Heading } from '@navikt/ds-react';

import { formatDate, formatDatePeriod } from '../../../utils/dateUtils';
import { cleanId } from '../../../utils/stringUtils';
import { Behandlingsdager } from '../../../shared/schema';
import CheckboxExplanation from '../../shared/checkboxexplanation/CheckboxExplanation';

import SporsmalListItem from './shared/SporsmalListItem';
import SporsmalList from './shared/SporsmalList';
import SporsmalListItemNested from './shared/SporsmalListItemNested';

const datoEllerIkkeTilBehandling = (dato: string): string => {
    /*if (svar.verdi === '' || svar.verdi === 'Ikke til behandling') {
        return 'Ikke til behandling';
    }*/
    return formatDate(dato);
};

function Behandlingsdager({ sporsmal }: { sporsmal: Behandlingsdager }): JSX.Element | null {
    const listItemId = cleanId(sporsmal.id);

    return (
        <SporsmalListItem listItemId={listItemId}>
            <Heading id={listItemId} size="xsmall" level="4">
                {sporsmal.sporsmalstekst}
            </Heading>
            <SporsmalList>
                {sporsmal.behandlingsdagerSporsmal.map((underspm) => {
                    const undersporsmalId = cleanId(underspm.id);
                    return (
                        <SporsmalListItemNested listItemId={undersporsmalId} key={undersporsmalId}>
                            <BodyShort id={undersporsmalId} size="small">
                                {formatDatePeriod(underspm.min, underspm.max)}
                            </BodyShort>
                            <CheckboxExplanation text={datoEllerIkkeTilBehandling(underspm.svar)} />
                        </SporsmalListItemNested>
                    );
                })}
            </SporsmalList>
        </SporsmalListItem>
    );
}

export default Behandlingsdager;

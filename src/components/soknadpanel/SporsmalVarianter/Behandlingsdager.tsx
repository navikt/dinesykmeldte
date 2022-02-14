import React from 'react';
import { BodyShort, Heading } from '@navikt/ds-react';

import { formatDate, formatDatePeriod } from '../../../utils/dateUtils';
import { cleanId } from '../../../utils/stringUtils';
import CheckboxExplanation from '../../shared/checkboxexplanation/CheckboxExplanation';
import { SoknadSporsmalSvarFragment } from '../../../graphql/queries/graphql.generated';

import { SporsmalVarianterProps } from './SporsmalVarianter';
// eslint-disable-next-line postcss-modules/no-unused-class
import styles from './SporsmalVarianter.module.css';

const datoEllerIkkeTilBehandling = (svar: SoknadSporsmalSvarFragment): string => {
    if (svar.verdi === '' || svar.verdi === 'Ikke til behandling') {
        return 'Ikke til behandling';
    }
    return formatDate(svar.verdi);
};

function Behandlingsdager({ sporsmal }: SporsmalVarianterProps): JSX.Element | null {
    const listItemId = cleanId(sporsmal.sporsmalstekst);
    const nestedListItemId = cleanId('nested-list-item-id');

    if (!sporsmal.undersporsmal || sporsmal.undersporsmal?.length === 0) return null;

    return (
        <li className={styles.listItem} aria-labelledby={listItemId}>
            <Heading id={listItemId} size="xsmall" level="4">
                {sporsmal.sporsmalstekst}
            </Heading>
            <ul className={styles.listItemList}>
                {sporsmal.undersporsmal.map((underspm, index) => {
                    return (
                        <li className={styles.nestedListItem} key={index} aria-labelledby={nestedListItemId + index}>
                            {underspm?.min && underspm?.max && (
                                <BodyShort id={nestedListItemId + index} size="small">
                                    {formatDatePeriod(underspm.min, underspm.max)}
                                </BodyShort>
                            )}
                            {underspm?.svar && underspm.svar[0] && (
                                <CheckboxExplanation text={datoEllerIkkeTilBehandling(underspm.svar[0])} />
                            )}
                        </li>
                    );
                })}
            </ul>
        </li>
    );
}

export default Behandlingsdager;

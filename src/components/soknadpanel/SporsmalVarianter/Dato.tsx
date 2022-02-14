import React from 'react';
import { BodyShort, Heading } from '@navikt/ds-react';

import { cleanId } from '../../../utils/stringUtils';
import { formatDate } from '../../../utils/dateUtils';

import { SporsmalVarianterProps } from './SporsmalVarianter';
// eslint-disable-next-line postcss-modules/no-unused-class
import styles from './SporsmalVarianter.module.css';

function Dato({ sporsmal }: SporsmalVarianterProps): JSX.Element | null {
    const listItemId = cleanId(sporsmal.sporsmalstekst);

    if (!sporsmal.svar || sporsmal.svar.length === 0) return null;

    return (
        <li className={styles.listItem} aria-labelledby={listItemId}>
            <Heading id={listItemId} size="xsmall" level="4">
                {sporsmal.sporsmalstekst}
            </Heading>
            <ul className={styles.listItemList}>
                {sporsmal.svar.map((svar, index) => {
                    return (
                        <li className={styles.nestedListItem} key={index}>
                            <BodyShort key={index} size="small">
                                {svar?.verdi && formatDate(svar.verdi)}
                            </BodyShort>
                        </li>
                    );
                })}
            </ul>
        </li>
    );
}

export default Dato;

import React from 'react';
import { BodyShort, Heading } from '@navikt/ds-react';

import { cleanId } from '../../../utils/stringUtils';

import { SporsmalVarianterProps } from './SporsmalVarianter';
// eslint-disable-next-line postcss-modules/no-unused-class
import styles from './SporsmalVarianter.module.css';

function Land({ sporsmal }: SporsmalVarianterProps): JSX.Element | null {
    const listItemId = cleanId(sporsmal.sporsmalstekst);

    if (!sporsmal.svar || sporsmal.svar.length === 0) return null;

    return (
        <li className={styles.listItem} aria-labelledby={listItemId}>
            <Heading id={listItemId} size="xsmall" level="4">
                {sporsmal.sporsmalstekst}
            </Heading>
            <ul className={styles.listItemList}>
                {sporsmal.svar?.map((svar, index) => {
                    return (
                        <li className={styles.nestedListItem} key={index}>
                            <BodyShort size="small">{svar?.verdi}</BodyShort>
                        </li>
                    );
                })}
            </ul>
        </li>
    );
}

export default Land;

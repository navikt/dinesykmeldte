import React from 'react';
import { Heading } from '@navikt/ds-react';
import parser from 'html-react-parser';

import { cleanId } from '../../../utils/stringUtils';

import { SporsmalVarianterProps } from './SporsmalVarianter';
import SporsmalListItem from './shared/SporsmalListItem';
import styles from './Undertekst.module.css';

function Undertekst({ sporsmal }: SporsmalVarianterProps): JSX.Element | null {
    const listItemId = cleanId(sporsmal.sporsmalstekst);
    const undertekst = sporsmal.undertekst;

    if (!undertekst) return null;

    return (
        <SporsmalListItem listItemId={listItemId}>
            <Heading id={listItemId} size="xsmall" level="4">
                {sporsmal.sporsmalstekst}
            </Heading>
            <div className={styles.nestedHtml}>{parser(undertekst)}</div>
        </SporsmalListItem>
    );
}

export default Undertekst;

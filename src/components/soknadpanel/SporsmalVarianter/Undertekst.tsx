import React from 'react';
import { Heading } from '@navikt/ds-react';
import parser from 'html-react-parser';

import { cleanId } from '../../../utils/stringUtils';
import { Undertekst } from '../../../shared/schema';

import SporsmalListItem from './shared/SporsmalListItem';
import styles from './Undertekst.module.css';

function Undertekst({ sporsmal }: { sporsmal: Undertekst }): JSX.Element | null {
    const listItemId = cleanId(sporsmal.id);

    return (
        <SporsmalListItem listItemId={listItemId}>
            <Heading id={listItemId} size="xsmall" level="4">
                {sporsmal.sporsmalstekst}
            </Heading>
            <div className={styles.nestedHtml}>{parser(sporsmal.html)}</div>
        </SporsmalListItem>
    );
}

export default Undertekst;

import React, { useState } from 'react';
import { Button } from '@navikt/ds-react';

import Veileder from './Veileder';
import styles from './DismissableVeileder.module.css';

type Props = {
    storageKey: string;
    text: string | string[];
};

function DismissableVeileder({ storageKey, text }: Props): JSX.Element | null {
    const [hasDismissed, setDismissed] = useState<boolean>(JSON.parse(localStorage.getItem(storageKey) ?? 'false'));

    if (hasDismissed) return null;

    return (
        <Veileder text={text}>
            <Button
                size="small"
                className={styles.okButton}
                onClick={() => {
                    localStorage.setItem(storageKey, 'true');
                    setDismissed(true);
                }}
            >
                OK
            </Button>
        </Veileder>
    );
}

export default DismissableVeileder;

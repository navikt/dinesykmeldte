import React, { PropsWithChildren, useState } from 'react';
import { BodyLong, Button } from '@navikt/ds-react';
import Veilederpanel from 'nav-frontend-veilederpanel';

import VeilederIcon from './VeilederIcon';
import styles from './Veileder.module.css';

export function DismissableVeileder({ storageKey, text }: { storageKey: string; text: string }): JSX.Element | null {
    const [hasDismissed, setDismissed] = useState<boolean>(JSON.parse(localStorage.getItem(storageKey) ?? 'false'));

    if (hasDismissed) return null;

    return (
        <Veileder text={text}>
            <Button
                size="s"
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

export function Veileder({ text, children }: PropsWithChildren<{ text: string | string[] }>): JSX.Element {
    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ maxWidth: '560px' }}>
                <Veilederpanel svg={<VeilederIcon />} kompakt fargetema="info">
                    {typeof text === 'string' ? (
                        <BodyLong>{text}</BodyLong>
                    ) : (
                        text.map((it, index) => (
                            <BodyLong key={it} spacing={index !== text.length - 1}>
                                {it}
                            </BodyLong>
                        ))
                    )}
                    {children}
                </Veilederpanel>
            </div>
        </div>
    );
}

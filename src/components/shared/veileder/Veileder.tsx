import React, { PropsWithChildren } from 'react';
import { BodyLong, GuidePanel } from '@navikt/ds-react';

import styles from './Veileder.module.css';

function Veileder({ text, children }: PropsWithChildren<{ text: string | string[] }>): JSX.Element {
    return (
        <div className={styles.veilederWrapper}>
            <div style={{ maxWidth: '560px' }}>
                <GuidePanel poster>
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
                </GuidePanel>
            </div>
        </div>
    );
}

export default Veileder;

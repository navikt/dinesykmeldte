import React, { PropsWithChildren } from 'react';
import { BodyLong } from '@navikt/ds-react';
import Veilederpanel from 'nav-frontend-veilederpanel';

import VeilederIcon from './VeilederIcon';
import styles from './Veileder.module.css';

function Veileder({ text, children }: PropsWithChildren<{ text: string | string[] }>): JSX.Element {
    return (
        <div className={styles.veilederWrapper}>
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

export default Veileder;

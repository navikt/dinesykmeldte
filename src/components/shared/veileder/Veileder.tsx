import React, { PropsWithChildren } from 'react';
import { BodyLong, GuidePanel } from '@navikt/ds-react';
import cn from 'classnames';

import styles from './Veileder.module.css';

interface Props {
    text: string | string[];
    border?: boolean;
}

function Veileder({ children, text, border = true }: PropsWithChildren<Props>): JSX.Element {
    return (
        <div className={cn(styles.veilederWrapper, { [styles.disableBorder]: !border })}>
            <GuidePanel className={styles.veilederPanel}>
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
    );
}

export default Veileder;

import React, { PropsWithChildren, ReactNode } from 'react';
import { BodyLong, GuidePanel } from '@navikt/ds-react';
import cn from 'classnames';

import styles from './Veileder.module.css';

interface Props {
    text: string | string[];
    border?: boolean;
    illustration?: ReactNode;
}

function Veileder({ children, text, border = true, illustration }: PropsWithChildren<Props>): JSX.Element {
    return (
        <div className={cn(styles.veilederWrapper, { [styles.disableBorder]: !border })}>
            <GuidePanel className={styles.veilederPanel} illustration={illustration}>
                {typeof text === 'string' ? (
                    <BodyLong>{text}</BodyLong>
                ) : (
                    text.map((it, index) => (
                        <BodyLong key={it} className={cn({ [styles.bodyLongMargin]: index !== text.length - 1 })}>
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

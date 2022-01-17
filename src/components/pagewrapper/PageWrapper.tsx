import { Detail, Heading } from '@navikt/ds-react';
import React, { ReactNode } from 'react';
import { Bandage } from '@navikt/ds-icons';

import VirksomhetPicker from '../virksomhetpicker/VirksomhetPicker';

import styles from './PageWrapper.module.css';

interface Props {
    title: {
        Icon: typeof Bandage;
        title: string;
        subtitle?: string;
    };
    children: ReactNode;
    hasPicker?: boolean;
}

function PageWrapper({ hasPicker = false, children, title }: Props) {
    return (
        <>
            <div className={styles.headerRoot}>
                <div className={styles.wrapper}>
                    <div className={styles.heading}>
                        <title.Icon />
                        <div className={styles.text}>
                            <Heading className={styles.mainTitle} level="1" size="2xlarge">
                                {title.title}
                            </Heading>
                            <Detail>{title.subtitle}</Detail>
                        </div>
                    </div>
                    {hasPicker && <VirksomhetPicker />}
                </div>
            </div>
            {children}
        </>
    );
}

export default PageWrapper;

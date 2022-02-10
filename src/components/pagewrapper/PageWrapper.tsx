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

function PageWrapper({ hasPicker = false, children, title }: Props): JSX.Element {
    return (
        <>
            <div className={styles.headerRoot}>
                <section className={styles.wrapper} aria-labelledby="page-header">
                    <div className={styles.heading}>
                        <title.Icon />
                        <div>
                            <Heading id="page-header" level="1" size="xlarge">
                                {title.title}
                            </Heading>
                            <Detail>{title.subtitle}</Detail>
                        </div>
                    </div>
                    {hasPicker && <VirksomhetPicker />}
                </section>
            </div>
            {children}
        </>
    );
}

export default PageWrapper;

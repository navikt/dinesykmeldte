import { BodyShort, Heading } from '@navikt/ds-react';
import React, { ReactNode } from 'react';
import { Bandage } from '@navikt/ds-icons';
import cn from 'classnames';

import VirksomhetPicker from '../virksomhetpicker/VirksomhetPicker';

import NewVersionWarning from './NewVersionWarning/NewVersionWarning';
import styles from './PageWrapper.module.css';

interface Props {
    title: {
        Icon?: typeof Bandage;
        title: string;
        subtitle?: ReactNode;
    };
    children: ReactNode;
    hasPicker?: boolean;
}

function PageWrapper({ hasPicker = false, children, title }: Props): JSX.Element {
    return (
        <>
            <div className={cn(styles.headerRoot, { [styles.hasPicker]: hasPicker })}>
                <section
                    className={cn(styles.wrapper, { [styles.withoutPicker]: !hasPicker })}
                    aria-labelledby="page-header"
                >
                    <div className={styles.heading}>
                        {title.Icon && <title.Icon />}
                        <div>
                            <Heading id="page-header" level="1" size="xlarge">
                                {title.title}
                            </Heading>
                            <BodyShort className={styles.subtitle}>{title.subtitle}</BodyShort>
                        </div>
                    </div>
                    {hasPicker && <VirksomhetPicker className={styles.virksomhetsPicker} />}
                </section>
            </div>
            <NewVersionWarning />
            {children}
        </>
    );
}

export default PageWrapper;

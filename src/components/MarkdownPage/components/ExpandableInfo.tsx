import React, { PropsWithChildren } from 'react';
import { Accordion } from '@navikt/ds-react';

import TimelineIcon, { Icons } from './TimelineIcon';
import styles from './ExpandableInfo.module.css';

interface Props {
    title: string;
    icon: Icons;
}

const ExpandableInfo = ({ children, title, icon }: PropsWithChildren<Props>): JSX.Element => {
    return (
        <div className={styles.accordionTimelineRoot}>
            <div className={styles.accordionTimelineLine} />
            <div className={styles.accordionTimelineDot} />
            <div className={styles.accordionTimelineWrapper}>
                <Accordion style={{ marginBottom: '32px' }}>
                    <Accordion.Item className={styles.accordionItem}>
                        <Accordion.Header>
                            <div className={styles.headerContent}>
                                <TimelineIcon icon={icon} />
                                {title}
                            </div>
                        </Accordion.Header>
                        <Accordion.Content className={styles.accordionContent}>{children}</Accordion.Content>
                    </Accordion.Item>
                </Accordion>
            </div>
        </div>
    );
};

export default ExpandableInfo;

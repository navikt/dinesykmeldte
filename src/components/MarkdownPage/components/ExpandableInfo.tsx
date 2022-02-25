import React, { PropsWithChildren, useState } from 'react';
import { Accordion } from '@navikt/ds-react';

import AccordionCloseButton from '../../shared/buttons/AccordionCloseButton';

import TimelineIcon, { Icons } from './TimelineIcon';
import styles from './ExpandableInfo.module.css';

interface Props {
    title: string;
    icon: Icons;
}

const ExpandableInfo = ({ children, title, icon }: PropsWithChildren<Props>): JSX.Element => {
    const [open, setOpen] = useState(false);
    const handleClick = (): void => setOpen((b) => !b);

    return (
        <div className={styles.accordionTimelineRoot}>
            <div className={styles.accordionTimelineLine} />
            <div className={styles.accordionTimelineDot} />
            <div className={styles.accordionTimelineWrapper}>
                <Accordion style={{ marginBottom: '32px' }}>
                    <Accordion.Item open={open}>
                        <Accordion.Header onClick={handleClick}>
                            <div className={styles.headerContent}>
                                <TimelineIcon icon={icon} />
                                {title}
                            </div>
                        </Accordion.Header>
                        <Accordion.Content className={styles.accordionContent}>
                            {children}
                            <AccordionCloseButton onClick={handleClick} />
                        </Accordion.Content>
                    </Accordion.Item>
                </Accordion>
            </div>
        </div>
    );
};

export default ExpandableInfo;

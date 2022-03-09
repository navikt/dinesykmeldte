import React, { PropsWithChildren } from 'react';
import { Label } from '@navikt/ds-react';

import Veileder from '../../shared/veileder/Veileder';
import TilbakeLink from '../../shared/TilbakeLink/TilbakeLink';

import styles from './Timeline.module.css';
import TimelineIcon, { Icons } from './TimelineIcon';

function Timeline({ children }: PropsWithChildren<unknown>): JSX.Element {
    return (
        <div>
            <TilbakeLink text="Tilbake til Dine sykmeldte" href="/" />
            <Veileder
                text={[
                    'Her ser du hva som er forventet av deg underveis i et sykefravær, og hva du kan forvente av den ansatte. ',
                    'Det kan gjøres unntak fra enkelte av aktivitetene hvis den ansatte er for syk.',
                    'Tidspunktene kan også endres hvis det er behov for det.',
                ]}
                border={false}
            />
            {children}
            <TilbakeLink text="Tilbake til Dine sykmeldte" href="/" marginTop />
        </div>
    );
}

export function TimelineEntry({
    children,
    icon,
    last = false,
}: PropsWithChildren<{ icon: Icons; last: boolean }>): JSX.Element {
    return (
        <div className={styles.timelineEntry}>
            <div>
                <TimelineIcon className={styles.timelineEntryIcon} icon={icon} />
                {!last && <div className={styles.timelineEntryLine} />}
            </div>
            <Label>{children}</Label>
        </div>
    );
}

export default Timeline;

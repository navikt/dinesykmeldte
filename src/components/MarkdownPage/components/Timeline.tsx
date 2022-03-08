import React, { PropsWithChildren } from 'react';
import { Label, Link } from '@navikt/ds-react';
import { Back } from '@navikt/ds-icons';

import Veileder from '../../shared/veileder/Veileder';

import styles from './Timeline.module.css';
import TimelineIcon, { Icons } from './TimelineIcon';

function Timeline({ children }: PropsWithChildren<unknown>): JSX.Element {
    return (
        <div>
            <Link className={styles.tilbakeLink} href="/">
                <Back />
                Tilbake til Dine sykmeldte
            </Link>
            <Veileder
                text={[
                    'Her ser du hva som er forventet av deg underveis i et sykefravær, og hva du kan forvente av den ansatte. ',
                    'Det kan gjøres unntak fra enkelte av aktivitetene hvis den ansatte er for syk.',
                    'Tidspunktene kan også endres hvis det er behov for det.',
                ]}
                border={false}
            />
            {children}
            <Link href="/">
                <Back />
                Tilbake til Dine sykmeldte
            </Link>
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

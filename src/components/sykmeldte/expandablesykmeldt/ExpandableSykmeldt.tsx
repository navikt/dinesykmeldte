import { Accordion } from '@navikt/ds-react';
import React from 'react';
import cn from 'classnames';

import { PreviewSykmeldtFragment } from '../../../graphql/queries/react-query.generated';

import SykmeldtCard from './sykmeldtcard/SykmeldtCard';
import SykmeldtContent from './sykmeldtcontent/SykmeldtContent';
import styles from './ExpandableSykmeldt.module.css';

interface Props {
    sykmeldt: PreviewSykmeldtFragment;
}

function ExpandableSykmeldt({ sykmeldt }: Props): JSX.Element {
    const hasNotifications =
        sykmeldt.previewSykmeldinger?.some((it) => !it.lest) || sykmeldt.previewSoknader.some((it) => !it.lest);

    return (
        <>
            <Accordion>
                <Accordion.Item
                    className={cn(styles.accordionRoot, { [styles.accordionRootNotification]: hasNotifications })}
                >
                    <Accordion.Header className={styles.accordionHeader}>
                        <SykmeldtCard sykmeldt={sykmeldt} notification={hasNotifications} />
                    </Accordion.Header>
                    <Accordion.Content className={styles.accordionContent}>
                        <SykmeldtContent sykmeldt={sykmeldt} notification={hasNotifications} />
                    </Accordion.Content>
                </Accordion.Item>
            </Accordion>
        </>
    );
}

export default ExpandableSykmeldt;

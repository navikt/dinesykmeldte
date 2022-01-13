import { Accordion } from '@navikt/ds-react';
import React from 'react';
import cn from 'classnames';

import { PreviewSykmeldtFragment } from '../../../graphql/queries/react-query.generated';
import { isPreviewSoknadNotification } from '../../../utils/soknadUtils';

import SykmeldtCard from './sykmeldtcard/SykmeldtCard';
import SykmeldtContent from './sykmeldtcontent/SykmeldtContent';
import styles from './ExpandableSykmeldt.module.css';

interface Props {
    sykmeldt: PreviewSykmeldtFragment;
    expanded: boolean;
    onClick: (id: string) => void;
}

function ExpandableSykmeldt({ sykmeldt, expanded, onClick }: Props): JSX.Element {
    const hasNotifications =
        sykmeldt.previewSykmeldinger?.some((it) => !it.lest) ||
        sykmeldt.previewSoknader.some((it) => isPreviewSoknadNotification(it));

    return (
        <>
            <Accordion>
                <Accordion.Item
                    open={expanded}
                    className={cn(styles.accordionRoot, { [styles.accordionRootNotification]: hasNotifications })}
                >
                    <Accordion.Header
                        className={styles.accordionHeader}
                        onClick={() => {
                            onClick(sykmeldt.narmestelederId);
                        }}
                    >
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

import { Accordion } from '@navikt/ds-react';
import React, { useEffect, useRef } from 'react';
import cn from 'classnames';

import { PreviewSykmeldtFragment } from '../../../graphql/queries/graphql.generated';

import ExpandableSykmeldtPeriodSummary from './ExpandableSykmeldtPeriodSummary/ExpandableSykmeldtPeriodSummary';
import SykmeldtSummary from './SykmeldtSummary/SykmeldtSummary';
import SykmeldtContent from './SykmeldtContent/SykmeldtContent';
import styles from './ExpandableSykmeldtPanel.module.css';
import SykmeldtInfo from './SykmeldtInfo/SykmeldtInfo';

interface Props {
    sykmeldt: PreviewSykmeldtFragment;
    expanded: boolean;
    periodsExpanded: boolean;
    onClick: (id: string, where: 'root' | 'periods') => void;
    notification: boolean;
    focusSykmeldtId: string | null;
}

function ExpandableSykmeldtPanel({
    sykmeldt,
    expanded,
    periodsExpanded,
    onClick,
    notification,
    focusSykmeldtId,
}: Props): JSX.Element {
    const ref = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (focusSykmeldtId !== sykmeldt.narmestelederId) return;

        ref.current?.focus();
        ref.current?.scrollIntoView({ behavior: 'smooth' });
    }, [focusSykmeldtId, sykmeldt.narmestelederId]);

    return (
        <Accordion>
            <Accordion.Item
                ref={ref}
                open={expanded}
                className={cn(styles.accordionRoot, {
                    [styles.accordionRootNotification]: notification,
                    [styles.accordionRootExpanded]: expanded,
                    [styles.accordionRootFocused]: sykmeldt.narmestelederId === focusSykmeldtId,
                })}
            >
                <Accordion.Header
                    id={`sykmeldt-accordion-header-${sykmeldt.narmestelederId}`}
                    className={styles.accordionHeader}
                    onClick={() => {
                        onClick(sykmeldt.narmestelederId, 'root');
                    }}
                >
                    <SykmeldtSummary sykmeldt={sykmeldt} notification={notification} />
                </Accordion.Header>
                <Accordion.Content className={styles.accordionContent}>
                    <SykmeldtInfo sykmeldt={sykmeldt} />
                    <ExpandableSykmeldtPeriodSummary
                        onClick={onClick}
                        expanded={periodsExpanded}
                        previewSykmeldt={sykmeldt}
                    />
                    <SykmeldtContent sykmeldt={sykmeldt} notification={notification} />
                </Accordion.Content>
            </Accordion.Item>
        </Accordion>
    );
}

export default ExpandableSykmeldtPanel;

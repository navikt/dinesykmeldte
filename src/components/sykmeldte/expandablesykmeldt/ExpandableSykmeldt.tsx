import { Accordion } from '@navikt/ds-react';
import React from 'react';
import cn from 'classnames';

import { PreviewSykmeldtFragment } from '../../../graphql/queries/react-query.generated';

import SykmeldtCard from './sykmeldtcard/SykmeldtCard';
import SykmeldtContent from './sykmeldtcontent/SykmeldtContent';
import styles from './ExpandableSykmeldt.module.css';
import { ExpandableSykmeldtSummary } from './expandablesykmeldtsummary/ExpandableSykmeldtSummary';

interface Props {
    sykmeldt: PreviewSykmeldtFragment;
    expanded: boolean;
    periodsExpanded: boolean;
    onClick: (id: string, where: 'root' | 'periods') => void;
    notification: boolean;
}

function ExpandableSykmeldt({ sykmeldt, expanded, periodsExpanded, onClick, notification }: Props): JSX.Element {
    return (
        <>
            <Accordion>
                <Accordion.Item
                    open={expanded}
                    className={cn(styles.accordionRoot, { [styles.accordionRootNotification]: notification })}
                >
                    <Accordion.Header
                        id={`sykmeldt-accordion-header-${sykmeldt.narmestelederId}`}
                        className={styles.accordionHeader}
                        onClick={() => {
                            onClick(sykmeldt.narmestelederId, 'root');
                        }}
                    >
                        <SykmeldtCard sykmeldt={sykmeldt} notification={notification} />
                    </Accordion.Header>
                    <Accordion.Content className={styles.accordionContent}>
                        <ExpandableSykmeldtSummary
                            onClick={onClick}
                            expanded={periodsExpanded}
                            previewSykmeldt={sykmeldt}
                        />
                        <SykmeldtContent sykmeldt={sykmeldt} notification={notification} />
                    </Accordion.Content>
                </Accordion.Item>
            </Accordion>
        </>
    );
}

export default ExpandableSykmeldt;

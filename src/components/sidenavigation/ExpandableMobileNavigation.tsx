import React, { PropsWithChildren } from 'react';
import { Accordion, BodyShort, Heading } from '@navikt/ds-react';
import { People } from '@navikt/ds-icons';

import { PreviewSykmeldtFragment } from '../../graphql/queries/react-query.generated';
import { sykmeldtStatusText } from '../../utils/sykmeldtUtils';

import styles from './ExpandableMobileNavigation.module.css';

interface Props {
    sykmeldt: PreviewSykmeldtFragment;
    className?: string;
}

const ExpandableMobileNavigation = ({ sykmeldt, children, className }: PropsWithChildren<Props>): JSX.Element => {
    return (
        <Accordion className={className}>
            <Accordion.Item>
                <Accordion.Header id={`sykmeldt-accordion-header-${sykmeldt.narmestelederId}`}>
                    <div className={styles.accordionHeaderContent}>
                        <People className={styles.peopleIcon} />
                        <div>
                            <Heading size="medium" level="3">
                                {sykmeldt.navn}
                            </Heading>
                            <BodyShort>{sykmeldtStatusText(sykmeldt)}</BodyShort>
                        </div>
                    </div>
                </Accordion.Header>
                <Accordion.Content className={styles.accordionContent}>{children}</Accordion.Content>
            </Accordion.Item>
        </Accordion>
    );
};

export default ExpandableMobileNavigation;
import React, { PropsWithChildren, useState } from 'react';
import { Accordion, BodyShort, Heading } from '@navikt/ds-react';
import { People } from '@navikt/ds-icons';

import { PreviewSykmeldtFragment } from '../../graphql/queries/react-query.generated';
import { sykmeldtStatusText } from '../../utils/sykmeldtUtils';
import AccordionCloseButton from '../shared/buttons/AccordionCloseButton';

import styles from './ExpandableMobileNavigation.module.css';

interface Props {
    sykmeldt: PreviewSykmeldtFragment;
    className?: string;
}

const ExpandableMobileNavigation = ({ sykmeldt, children, className }: PropsWithChildren<Props>): JSX.Element => {
    const [open, setOpen] = useState(false);
    const handleClick = (): void => setOpen((b) => !b);

    return (
        <Accordion className={className}>
            <Accordion.Item open={open}>
                <Accordion.Header id={`sykmeldt-accordion-header-${sykmeldt.narmestelederId}`} onClick={handleClick}>
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
                <Accordion.Content className={styles.accordionContent}>
                    {children}
                    <AccordionCloseButton onClick={handleClick} />
                </Accordion.Content>
            </Accordion.Item>
        </Accordion>
    );
};

export default ExpandableMobileNavigation;

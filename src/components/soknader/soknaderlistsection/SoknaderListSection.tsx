import { Cell, Grid, Heading, Modal, Tag } from '@navikt/ds-react';
import { Task } from '@navikt/ds-icons';
import React, { useState } from 'react';

import { PreviewSoknadFragment } from '../../../graphql/queries/graphql.generated';
import LinkPanel, { ButtonPanel } from '../../shared/links/LinkPanel';
import { formatDateRange } from '../../../utils/dateUtils';
import {
    getSoknadActivationDate,
    getSoknadSykmeldingPeriodDescription,
    isPreviewSoknadNotification,
} from '../../../utils/soknadUtils';
import { cleanId } from '../../../utils/stringUtils';

import SoknadModalContent from './soknadmodal/SoknadModalContent';
import styles from './SoknaderListSection.module.css';

interface Props {
    title: string;
    sykmeldtId: string;
    soknader: PreviewSoknadFragment[];
}

function SoknaderListSection({ title, soknader, sykmeldtId }: Props): JSX.Element | null {
    if (soknader.length === 0) return null;

    return (
        <section aria-labelledby={`soknader-list-${cleanId(title)}-header`} className={styles.sectionRoot}>
            <Heading
                id={`soknader-list-${cleanId(title)}-header`}
                size="medium"
                level="2"
                className={styles.listHeader}
            >
                {title}
            </Heading>
            <Grid>
                {soknader.map((it) => (
                    <Cell key={it.id} xs={12}>
                        <SoknadPanel sykmeldtId={sykmeldtId} soknad={it} />
                    </Cell>
                ))}
            </Grid>
        </section>
    );
}

function SoknadPanel({ sykmeldtId, soknad }: { sykmeldtId: string; soknad: PreviewSoknadFragment }): JSX.Element {
    const [open, setIsOpen] = useState(false);

    const commonProps = {
        detail: soknad.fom && soknad.tom ? formatDateRange(soknad.fom, soknad.tom) : undefined,
        Icon: Task,
        tag: <SoknadTag soknad={soknad} />,
        description: soknad.perioder.map((it) => getSoknadSykmeldingPeriodDescription(it)).join(', '),
        notify: isPreviewSoknadNotification(soknad),
    };

    if (soknad.__typename === 'PreviewSendtSoknad') {
        return (
            <LinkPanel href={`/sykmeldt/${sykmeldtId}/soknad/${soknad.id}`} {...commonProps}>
                Søknad om sykepenger
            </LinkPanel>
        );
    }

    return (
        <>
            <ButtonPanel onClick={() => setIsOpen(true)} {...commonProps}>
                Søknad om sykepenger
            </ButtonPanel>
            {open && (
                <Modal open onClose={() => setIsOpen(false)} aria-labelledby={`soknad-modal-label-${soknad.id}`}>
                    <SoknadModalContent
                        soknad={soknad}
                        labelId={`soknad-modal-label-${soknad.id}`}
                        onOk={() => setIsOpen(false)}
                    />
                </Modal>
            )}
        </>
    );
}

function SoknadTag({ soknad }: { soknad: PreviewSoknadFragment }): JSX.Element | null {
    switch (soknad.__typename) {
        case 'PreviewNySoknad':
            if (soknad.ikkeSendtSoknadVarsel) {
                return (
                    <Tag variant="warning" size="small">
                        Søknad er ikke sendt
                    </Tag>
                );
            }
        case 'PreviewFremtidigSoknad':
            if (!soknad.tom) return null;

            return (
                <Tag variant="info" size="small">
                    Aktiveres {getSoknadActivationDate(soknad.tom)}
                </Tag>
            );
        case 'PreviewSendtSoknad':
            if (!soknad.korrigererSoknadId) return null;

            return (
                <Tag variant="info" size="small">
                    Korrigering
                </Tag>
            );
    }
}

export default SoknaderListSection;

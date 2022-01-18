import { Cell, Grid, Heading, Tag } from '@navikt/ds-react';
import { Task } from '@navikt/ds-icons';
import React from 'react';
import { add, parseISO } from 'date-fns';

import { PreviewSoknadFragment } from '../../../graphql/queries/react-query.generated';
import LinkPanel from '../../shared/links/LinkPanel';
import { formatDate, formatDateRange } from '../../../utils/dateUtils';
import { isPreviewSoknadNotification } from '../../../utils/soknadUtils';
import { cleanId } from '../../../utils/stringUtils';

import PreviewSoknadDescription from './PreviewSoknadDescription';
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
                        <LinkPanel
                            detail={it.fom && it.tom ? formatDateRange(it.fom, it.tom) : undefined}
                            href={`/sykmeldt/${sykmeldtId}/soknad/${it.id}`}
                            Icon={Task}
                            tag={getSoknadTag(it)}
                            description={it.sykmeldingId && <PreviewSoknadDescription sykmeldingId={it.sykmeldingId} />}
                            notify={isPreviewSoknadNotification(it)}
                        >
                            Søknad om sykepenger
                        </LinkPanel>
                    </Cell>
                ))}
            </Grid>
        </section>
    );
}

function getSoknadTag(soknad: PreviewSoknadFragment): React.ReactNode {
    switch (soknad.__typename) {
        case 'PreviewNySoknad':
            return (
                <Tag variant="warning" size="small">
                    Søknadsfrist {formatDate(soknad.frist)}
                </Tag>
            );
        case 'PreviewFremtidigSoknad':
            if (!soknad.tom) return null;

            return (
                <Tag variant="info" size="small">
                    Aktiveres {formatDate(add(parseISO(soknad.tom), { days: 1 }))}
                </Tag>
            );
        case 'PreviewKorrigertSoknad':
        case 'PreviewSendtSoknad':
            return null;
    }
}

export default SoknaderListSection;

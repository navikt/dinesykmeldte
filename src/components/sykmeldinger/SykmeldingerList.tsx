import React from 'react';
import { Cell, Grid, Heading } from '@navikt/ds-react';
import { Bandage } from '@navikt/ds-icons';

import { PreviewSykmeldtFragment } from '../../graphql/queries/react-query.generated';
import { HighlightedLinkPanel, LinkPanel } from '../shared/links/LinkPanel';

import styles from './SykmeldingerList.module.css';

interface Props {
    sykmeldtId: string;
    sykmeldt: PreviewSykmeldtFragment;
}

function SykmeldingerList({ sykmeldtId, sykmeldt }: Props): JSX.Element {
    const unreadSykmeldinger = sykmeldt.previewSykmeldinger.filter((it) => !it.lest);
    const readSykmeldinger = sykmeldt.previewSykmeldinger.filter((it) => it.lest);

    return (
        <div className={styles.listRoot}>
            <section aria-labelledby="sykmeldinger-list-uleste-header">
                <Heading id="sykmeldinger-list-uleste-header" size="medium" level="2" className={styles.listHeader}>
                    Uleste sykmeldinger
                </Heading>
                <Grid>
                    {unreadSykmeldinger.map((it) => (
                        <Cell key={it.id} xs={12}>
                            <HighlightedLinkPanel
                                href={`/sykmeldt/${sykmeldtId}/sykmelding/${it.id}`}
                                Icon={Bandage}
                                description="TODO antall dager"
                            >
                                Sykmelding
                            </HighlightedLinkPanel>
                        </Cell>
                    ))}
                </Grid>
            </section>
            <section aria-labelledby="sykmeldinger-list-leste-header">
                <Heading id="sykmeldinger-list-leste-header" size="medium" level="2" className={styles.listHeader}>
                    Leste sykmeldinger
                </Heading>
                <Grid>
                    {readSykmeldinger.map((it) => (
                        <Cell key={it.id} xs={12}>
                            <LinkPanel href={`/sykmeldt/${sykmeldtId}/sykmelding/${it.id}`} Icon={Bandage}>
                                Sykmelding
                            </LinkPanel>
                        </Cell>
                    ))}
                </Grid>
            </section>
        </div>
    );
}

export default SykmeldingerList;

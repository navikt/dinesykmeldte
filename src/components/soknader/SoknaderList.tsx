import React from 'react';
import { Cell, Grid, Heading } from '@navikt/ds-react';
import { Task } from '@navikt/ds-icons';

import { PreviewSykmeldtFragment } from '../../graphql/queries/react-query.generated';
import { HighlightedLinkPanel, LinkPanel } from '../shared/links/LinkPanel';

import styles from './SoknaderList.module.css';

interface Props {
    sykmeldtId: string;
    sykmeldt: PreviewSykmeldtFragment;
}

function SoknaderList({ sykmeldtId, sykmeldt }: Props): JSX.Element {
    const unreadSoknader = sykmeldt.previewSoknader.filter((it) => !it.lest);
    const readSoknader = sykmeldt.previewSoknader.filter((it) => it.lest);

    return (
        <div className={styles.listRoot}>
            <section aria-labelledby="soknader-list-uleste-header">
                <Heading id="soknader-list-uleste-header" size="medium" level="2" className={styles.listHeader}>
                    Uleste søknader
                </Heading>
                <Grid>
                    {unreadSoknader.map((it) => (
                        <Cell key={it.id} xs={12}>
                            <HighlightedLinkPanel
                                href={`/sykmeldt/${sykmeldtId}/soknad/${it.id}`}
                                Icon={Task}
                                description="TODO"
                            >
                                Søknad
                            </HighlightedLinkPanel>
                        </Cell>
                    ))}
                </Grid>
            </section>
            <section aria-labelledby="soknader-list-lest-header">
                <Heading id="soknader-list-lest-header" size="medium" level="2" className={styles.listHeader}>
                    Leste søknader
                </Heading>
                <Grid>
                    {readSoknader.map((it) => (
                        <Cell key={it.id} xs={12}>
                            <LinkPanel href={`/sykmeldt/${sykmeldtId}/soknad/${it.id}`} Icon={Task}>
                                Søknad
                            </LinkPanel>
                        </Cell>
                    ))}
                </Grid>
            </section>
        </div>
    );
}

export default SoknaderList;

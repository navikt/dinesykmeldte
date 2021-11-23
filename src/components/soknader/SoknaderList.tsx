import React from 'react';
import { Cell, Grid, Heading } from '@navikt/ds-react';
import { Task } from '@navikt/ds-icons';

import { PreviewSykmeldtFragment } from '../../graphql/queries/react-query.generated';
import { HighlightedLinkContent, PlainLinkContent } from '../shared/links/LinkContent';

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
            <Heading size="medium" level="2" className={styles.listHeader}>
                Uleste søknader
            </Heading>
            <Grid>
                {unreadSoknader.map((it) => (
                    <Cell key={it.id} xs={12}>
                        <HighlightedLinkContent
                            href={`/sykmeldt/${sykmeldtId}/soknad/${it.id}`}
                            Icon={Task}
                            description="TODO"
                        >
                            Søknad
                        </HighlightedLinkContent>
                    </Cell>
                ))}
                {readSoknader.map((it) => (
                    <Cell key={it.id} xs={12}>
                        <PlainLinkContent href={`/sykmeldt/${sykmeldtId}/soknad/${it.id}`} Icon={Task}>
                            Søknad
                        </PlainLinkContent>
                    </Cell>
                ))}
            </Grid>
        </div>
    );
}

export default SoknaderList;

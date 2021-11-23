import React from 'react';
import { Cell, Grid, Heading } from '@navikt/ds-react';
import { Bandage } from '@navikt/ds-icons';

import { PreviewSykmeldtFragment } from '../../graphql/queries/react-query.generated';
import { HighlightedLinkContent, PlainLinkContent } from '../shared/links/LinkContent';

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
            <Heading size="medium" level="2" className={styles.listHeader}>
                Uleste sykmeldinger
            </Heading>
            <Grid>
                {unreadSykmeldinger.map((it) => (
                    <Cell key={it.id} xs={12}>
                        <HighlightedLinkContent
                            href={`/sykmeldt/${sykmeldtId}/sykmelding/${it.id}`}
                            Icon={Bandage}
                            description="TODO antall dager"
                        >
                            Sykmelding
                        </HighlightedLinkContent>
                    </Cell>
                ))}
                {readSykmeldinger.map((it) => (
                    <Cell key={it.id} xs={12}>
                        <PlainLinkContent href={`/sykmeldt/${sykmeldtId}/sykmelding/${it.id}`} Icon={Bandage}>
                            Sykmelding
                        </PlainLinkContent>
                    </Cell>
                ))}
            </Grid>
        </div>
    );
}

export default SykmeldingerList;

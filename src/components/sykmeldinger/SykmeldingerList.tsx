import React from 'react';
import { useRouter } from 'next/router';
import { BodyShort, Cell, Grid, LinkPanel, Heading } from '@navikt/ds-react';
import { Bandage } from '@navikt/ds-icons';
import Link from 'next/link';

import { useSykmeldteByVirksomhetQuery } from '../../graphql/queries/react-query.generated';

import styles from './SykmeldingerList.module.css';

function SykmeldingerList(): JSX.Element {
    const {
        query: { sykmeldtId },
    } = useRouter();

    if (!sykmeldtId || typeof sykmeldtId !== 'string') {
        throw new Error('Illegal state: Can display list without person uuid path parameter');
    }

    const { data } = useSykmeldteByVirksomhetQuery({ virksomhetId: 'test' });

    return (
        <div className={styles.listRoot}>
            <Heading size="medium" level="2" className={styles.listHeader}>
                Uleste sykmeldinger
            </Heading>
            <Grid>
                {data?.virksomhet?.sykmeldte?.map((it) => (
                    <Cell key={it.uuid} xs={12}>
                        <SykmeldingListItem />
                    </Cell>
                ))}
            </Grid>
        </div>
    );
}

function SykmeldingListItem() {
    const { asPath } = useRouter();

    return (
        <Link href={`${asPath}/sykmelding/TODO`} passHref>
            <LinkPanel>
                <div
                    style={{
                        display: 'grid',
                        gridAutoFlow: 'column',
                        gap: '2rem',
                        alignItems: 'center',
                    }}
                >
                    <Bandage fontSize="28px" focusable={false} />
                    <div>
                        <Heading size="medium" level="3">
                            TODO
                        </Heading>
                        <BodyShort>TODO ekstra info</BodyShort>
                    </div>
                </div>
            </LinkPanel>
        </Link>
    );
}

export default SykmeldingerList;

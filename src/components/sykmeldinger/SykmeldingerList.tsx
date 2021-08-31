import React from 'react';
import { useRouter } from 'next/router';
import { BodyShort, Cell, Grid, LinkPanel, Title } from '@navikt/ds-react';
import { Bandage } from '@navikt/ds-icons';
import Link from 'next/link';

import { useSykmeldingerQuery } from '../../graphql/queries/react-query.generated';

import styles from './SykmeldingerList.module.css';

function SykmeldingerList(): JSX.Element {
    const {
        query: { uuid },
    } = useRouter();

    if (!uuid || typeof uuid !== 'string') {
        throw new Error('Illegal state: Can display list without person uuid path parameter');
    }

    const { data } = useSykmeldingerQuery({ selectedOrg: 'test' });

    return (
        <div className={styles.listRoot}>
            <Title size="m" level={2} className={styles.listHeader}>
                Uleste sykmeldinger
            </Title>
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
                        <Title size="m" level={3}>
                            TODO
                        </Title>
                        <BodyShort>TODO ekstra info</BodyShort>
                    </div>
                </div>
            </LinkPanel>
        </Link>
    );
}

export default SykmeldingerList;

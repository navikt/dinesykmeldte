import React from 'react';
import { BodyShort, Cell, Grid, LinkPanel, Loader, Title } from '@navikt/ds-react';
import { People } from '@navikt/ds-icons';
import Link from 'next/link';

import { FullSykmeldtFragment, useSykmeldingerQuery } from '../../graphql/queries/react-query.generated';

import styles from './DineSykmeldteList.module.css';

function DineSykmeldteList(): JSX.Element {
    const { isLoading, data, error } = useSykmeldingerQuery({ selectedOrg: 'test' });

    if (isLoading) {
        return <Loader title="Laster dine ansatte" size="2xl" />;
    }

    if (error) {
        return <div>TODO error state</div>;
    }

    return (
        <Grid>
            {data?.virksomhet?.sykmeldte?.map((it) => (
                <Cell key={it.navn} xs={12}>
                    <SykmeldtListItem sykmeldt={it} />
                </Cell>
            ))}
        </Grid>
    );
}

function SykmeldtListItem({ sykmeldt }: { sykmeldt: FullSykmeldtFragment }): JSX.Element {
    return (
        <Link href={`/sykmeldt/${sykmeldt.uuid}`} passHref>
            <LinkPanel>
                <div
                    style={{
                        display: 'grid',
                        gridAutoFlow: 'column',
                        gap: '2rem',
                        alignItems: 'center',
                    }}
                >
                    <div className={styles.listItemPeopleIconWrapper}>
                        <People fontSize="28px" focusable={false} />
                    </div>
                    <div>
                        <Title size="m" level={3}>
                            {sykmeldt.navn}
                        </Title>
                        <BodyShort>TODO ekstra info</BodyShort>
                    </div>
                </div>
            </LinkPanel>
        </Link>
    );
}

export default DineSykmeldteList;

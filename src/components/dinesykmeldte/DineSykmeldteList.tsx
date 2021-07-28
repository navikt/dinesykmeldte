import React from 'react';
import { BodyShort, Cell, Grid, LinkPanel, Loader, Title } from '@navikt/ds-react';
import { People } from '@navikt/ds-icons';
import Link from 'next/link';

import { DineSykmeldteQuery, useDineSykmeldteQuery } from '../../graphql/queries/react-query.generated';

import styles from './DineSykmeldteList.module.css';

function DineSykmeldteList(): JSX.Element {
    const { isLoading, data, error } = useDineSykmeldteQuery({});

    if (isLoading) {
        return <Loader title="Laster dine ansatte" size="2xl" />;
    }

    if (error) {
        return <div>TODO error state</div>;
    }

    return (
        <Grid>
            {data?.dineSykmeldte.map((it) => (
                <Cell key={it.fodselsNummer} xs={12}>
                    <SykmeldtListItem person={it} />
                </Cell>
            ))}
        </Grid>
    );
}

function SykmeldtListItem({ person }: { person: DineSykmeldteQuery['dineSykmeldte'][0] }): JSX.Element {
    return (
        <Link href={`/sykmeldt/${person.uuid}`} passHref>
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
                            {person.navn}
                        </Title>
                        <BodyShort>TODO ekstra info</BodyShort>
                    </div>
                </div>
            </LinkPanel>
        </Link>
    );
}

export default DineSykmeldteList;

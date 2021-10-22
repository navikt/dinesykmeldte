import React from 'react';
import { Accordion, BodyShort, Cell, Grid, Loader, Heading } from '@navikt/ds-react';
import { People } from '@navikt/ds-icons';
import Link from 'next/link';

import { FullSykmeldtFragment, useSykmeldteByVirksomhetQuery } from '../../graphql/queries/react-query.generated';

import styles from './SykmeldteList.module.css';

function SykmeldteList(): JSX.Element {
    const { isLoading, data, error } = useSykmeldteByVirksomhetQuery({ virksomhetId: 'test' });

    if (isLoading) {
        return <Loader title="Laster dine ansatte" size="2xlarge" />;
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

function SykmeldingerAccordionListItem() {
    return (
        <div className={styles.accordionListItem}>
            <div className={styles.listItemPeopleIconWrapper}>
                <People fontSize="28px" focusable={false} />
            </div>
            <div>
                <Heading size="medium" level="3">
                    mor
                </Heading>
                <BodyShort>TODO ekstra info</BodyShort>
            </div>
        </div>
    );
}

function SykmeldtListItem({ sykmeldt }: { sykmeldt: FullSykmeldtFragment }): JSX.Element {
    return (
        <Accordion>
            <Accordion.Item>
                <Accordion.Header>
                    <SykmeldingerAccordionListItem />
                </Accordion.Header>
                <Accordion.Content>
                    <div className={styles.tempWrapper}>
                        <Link href={`/sykmeldt/${sykmeldt.uuid}`}>Gå til oversikt</Link>
                        <Link href={`/sykmeldt/${sykmeldt.uuid}/sykmelding/${sykmeldt.sykmeldinger[0].id}`}>
                            Gå til nyeste sykmelding
                        </Link>
                        <Link href={`/sykmeldt/${sykmeldt.uuid}/soknad/temp-fake-id`}>Gå til nyeste søknad</Link>
                    </div>
                </Accordion.Content>
            </Accordion.Item>
        </Accordion>
    );
}

export default SykmeldteList;

import React from 'react';
import Head from 'next/head';
import { Alert, BodyLong, ContentContainer, Heading } from '@navikt/ds-react';
import { CoApplicant } from '@navikt/ds-icons';

import { createSsrApolloClient, prefetchMutlipleQueries, wrapProps } from '../graphql/prefetching';
import { GetServerSidePropsPrefetchResult } from '../shared/types';
import SykmeldteList from '../components/sykmeldte/SykmeldteList';
import SykmeldteInfoPanel from '../components/SykmeldtInfoPanel/SykmeldteInfoPanel';
import { withAuthenticatedPage } from '../auth/withAuthentication';
import { useUpdateBreadcrumbs } from '../hooks/useBreadcrumbs';
import PageWrapper from '../components/pagewrapper/PageWrapper';
import SykmeldteFilter from '../components/sykmeldtefilter/SykmeldteFilter';
import NarmestelederInfo from '../components/NarmestelederInfo/NarmestelederInfo';
import { MineSykmeldteDocument, VirksomheterDocument } from '../graphql/queries/graphql.generated';

import styles from './index.module.css';

function Home(): JSX.Element {
    useUpdateBreadcrumbs(() => []);

    return (
        <PageWrapper title={{ Icon: CoApplicant, title: 'Dine sykmeldte' }} hasPicker>
            <Head>
                <title>Dine sykmeldte - nav.no</title>
            </Head>
            <ContentContainer>
                <div className={styles.tempWarning}>
                    <Alert variant="warning">
                        <Heading size="xsmall" level="3">
                            Vi har problemer med å vise varselet om at du kan melde behov for dialogmøte.
                        </Heading>
                        <BodyLong size="small">
                            Hvis du vet hvem det gjelder, kan du selv finne skjemaet ved å trykke på arbeidstakeren og
                            velge dialogmøter i menyen. Vi jobber med å rette feilen.
                        </BodyLong>
                    </Alert>
                    <Alert variant="info">
                        <BodyLong size="small">
                            I overgangen til ny løsning kan det forekomme feil og mangler. Vi jobber kontinuerlig med å
                            løse problemer som oppstår.
                        </BodyLong>
                    </Alert>
                </div>
                <SykmeldteInfoPanel />
                <SykmeldteFilter />
                <SykmeldteList />
                <NarmestelederInfo />
            </ContentContainer>
        </PageWrapper>
    );
}

export const getServerSideProps = withAuthenticatedPage(
    async (context, version, isIE): Promise<GetServerSidePropsPrefetchResult> => {
        const client = createSsrApolloClient(context.req);

        if (context.req.url !== '/') {
            // When navigating to root on the client side, don't SSR-fetch queries again
            return { props: { version, isIE } };
        }

        await prefetchMutlipleQueries([
            client.query({ query: MineSykmeldteDocument }),
            client.query({ query: VirksomheterDocument }),
        ]);

        return {
            props: wrapProps(client, version, isIE),
        };
    },
);

export default Home;

import React from 'react';
import Head from 'next/head';
import { ContentContainer } from '@navikt/ds-react';
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
import UxSignalsWidget from '../components/UxSignals/UxSignalsWidget';
import { MineSykmeldteDocument, VirksomheterDocument } from '../graphql/queries/graphql.generated';

function Home(): JSX.Element {
    useUpdateBreadcrumbs(() => []);

    return (
        <PageWrapper title={{ Icon: CoApplicant, title: 'Dine sykmeldte' }} hasPicker>
            <Head>
                <title>Dine sykmeldte - nav.no</title>
            </Head>
            <ContentContainer>
                <SykmeldteInfoPanel />
                <SykmeldteFilter />
                <SykmeldteList />
                <UxSignalsWidget />
                <NarmestelederInfo />
            </ContentContainer>
        </PageWrapper>
    );
}

export const getServerSideProps = withAuthenticatedPage(
    async (context, version, isIE): Promise<GetServerSidePropsPrefetchResult> => {
        const client = createSsrApolloClient(context.req);

        if (context.req.url !== '/' && !context.req.url?.startsWith('/sykmeldt/')) {
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

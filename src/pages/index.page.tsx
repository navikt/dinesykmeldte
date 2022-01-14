import React from 'react';
import Head from 'next/head';
import { ContentContainer } from '@navikt/ds-react';
import { QueryClient } from 'react-query';
import { CoApplicant } from '@navikt/ds-icons';

import { createPrefetch, prefetchMutlipleQueries, wrapProps } from '../graphql/prefetching';
import { GetServerSidePropsPrefetchResult } from '../shared/types';
import SykmeldteList from '../components/sykmeldte/SykmeldteList';
import SykmeldteInfoPanel from '../components/sykmeldteinfopanel/SykmeldteInfoPanel';
import { withAuthenticatedPage } from '../auth/withAuthentication';
import { logger } from '../utils/logger';
import { useMineSykmeldteQuery, useVirksomheterQuery } from '../graphql/queries/react-query.generated';
import { useUpdateBreadcrumbs } from '../hooks/useBreadcrumbs';
import PageWrapper from '../components/pagewrapper/PageWrapper';

function Home(): JSX.Element {
    useUpdateBreadcrumbs(() => []);

    return (
        <PageWrapper title={{ Icon: CoApplicant, title: 'Dine sykmeldte' }} hasPicker>
            <Head>
                <title>Dine sykmeldte - nav.no</title>
            </Head>
            <ContentContainer>
                <SykmeldteInfoPanel />
                <SykmeldteList />
            </ContentContainer>
        </PageWrapper>
    );
}

export const getServerSideProps = withAuthenticatedPage(async (context): Promise<GetServerSidePropsPrefetchResult> => {
    const client = new QueryClient();

    logger.info(`In server fetching, preFetching virksomeheter and mineSykmeldte`);

    await prefetchMutlipleQueries({ client, context }, [
        createPrefetch(useVirksomheterQuery),
        createPrefetch(useMineSykmeldteQuery),
    ]);

    return {
        props: wrapProps(client),
    };
});

export default Home;

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
import SykmeldteFilter from '../components/sykmeldtefilter/SykmeldteFilter';
import useSelectedVirksomhet from '../hooks/useSelectedSykmeldt';
import { filterSykmeldteByOrg } from '../components/sykmeldte/useFilteredSykmeldte';

function Home(): JSX.Element {
    const hasMoreThan5InOrg = useIsMoreThan5SykmeldteInSelectedVirksomhet();

    useUpdateBreadcrumbs(() => []);

    return (
        <PageWrapper title={{ Icon: CoApplicant, title: 'Dine sykmeldte' }} hasPicker>
            <Head>
                <title>Dine sykmeldte - nav.no</title>
            </Head>
            <ContentContainer>
                <SykmeldteInfoPanel />
                {hasMoreThan5InOrg && <SykmeldteFilter />}
                <SykmeldteList />
            </ContentContainer>
        </PageWrapper>
    );
}

function useIsMoreThan5SykmeldteInSelectedVirksomhet(): boolean {
    const { data } = useMineSykmeldteQuery();
    const selectedVirksomhet = useSelectedVirksomhet();

    if (!data?.mineSykmeldte?.length) return false;

    return filterSykmeldteByOrg(selectedVirksomhet, data.mineSykmeldte).length >= 5;
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

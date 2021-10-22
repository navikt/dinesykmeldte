import React from 'react';
import Head from 'next/head';
import { ContentContainer } from '@navikt/ds-react';
import { QueryClient } from 'react-query';

import queryPrefetcher, { wrapProps } from '../graphql/queryPrefetcher';
import { GetServerSidePropsPrefetchResult } from '../shared/types';
import SykmeldteList from '../components/sykmeldte/SykmeldteList';
import VirksomhetPicker from '../components/virksomhetpicker/VirksomhetPicker';
import SykmeldteInfoPanel from '../components/sykmeldteinfopanel/SykmeldteInfoPanel';
import { withAuthenticatedPage } from '../auth/withAuthantication';
import { useSykmeldteByVirksomhetQuery } from '../graphql/queries/react-query.generated';
import { logger } from '../utils/logger';

function Home(): JSX.Element {
    return (
        <div>
            <Head>
                <title>Dine sykmeldte - nav.no</title>
            </Head>
            <ContentContainer>
                <SykmeldteInfoPanel />
                <VirksomhetPicker />
                <SykmeldteList />
            </ContentContainer>
        </div>
    );
}

export const getServerSideProps = withAuthenticatedPage(async (context): Promise<GetServerSidePropsPrefetchResult> => {
    const client = new QueryClient();

    logger.info(`In server fetching, preFetching useSykmeldinger`);
    await queryPrefetcher({ client, context }, useSykmeldteByVirksomhetQuery, { virksomhetId: 'test' });

    return {
        props: wrapProps(client),
    };
});

export default Home;

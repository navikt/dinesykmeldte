import React from 'react';
import Head from 'next/head';
import { ContentContainer } from '@navikt/ds-react';
import { QueryClient } from 'react-query';

import { useDineSykmeldteQuery } from '../graphql/queries/react-query.generated';
import queryPrefetcher, { wrapProps } from '../graphql/queryPrefetcher';
import { GetServerSidePropsPrefetchResult } from '../shared/types';
import DineSykmeldteList from '../components/dinesykmeldte/DineSykmeldteList';
import VirksomhetPicker from '../components/virksomhetpicker/VirksomhetPicker';
import DineSykmeldteInfoPanel from '../components/dinesykmeldteinfopanel/DineSykmeldteInfoPanel';
import { withAuthenticatedPage } from '../auth/withSession';

function Home(): JSX.Element {
    return (
        <div>
            <Head>
                <title>Dine sykmeldte - nav.no</title>
            </Head>
            <ContentContainer>
                <DineSykmeldteInfoPanel />
                <VirksomhetPicker />
                <DineSykmeldteList />
            </ContentContainer>
        </div>
    );
}

export const getServerSideProps = withAuthenticatedPage(async (context): Promise<GetServerSidePropsPrefetchResult> => {
    const client = new QueryClient();

    await queryPrefetcher({ client, context }, useDineSykmeldteQuery, {});

    return {
        props: wrapProps(client),
    };
});

export default Home;

import React from 'react';
import Head from 'next/head';
import { Button } from '@navikt/ds-react';
import { QueryClient } from 'react-query';
import { dehydrate } from 'react-query/hydration';

import { useArglessTestQueryQuery, useTestQueryQuery } from '../graphql/queries/react-query.generated';
import queryPrefetcher from '../graphql/queryPrefetcher';
import TestComponent from '../components/TestComponent';
import { GetServerSidePropsPrefetchResult } from '../shared/types';

import styles from './index.module.css';

function Home(): JSX.Element {
    return (
        <div>
            <Head>
                <title>Dine sykmeldte - nav.no</title>
            </Head>
            <div className={styles.buttonWrapper}>
                <Button className={styles.button}>Eksempel på knapp fra nytt design-system</Button>
            </div>
            <TestComponent />
        </div>
    );
}

export const getServerSideProps = async (): Promise<GetServerSidePropsPrefetchResult> => {
    const queryClient = new QueryClient();

    await queryPrefetcher(queryClient, useTestQueryQuery, { baz: 'hey' });
    await queryPrefetcher(queryClient, useArglessTestQueryQuery);

    return {
        props: {
            dehydratedState: dehydrate(queryClient),
        },
    };
};

export default Home;

import '../style/global.css';

import React, { PropsWithChildren, useEffect, useState } from 'react';
import type { AppProps as NextAppProps } from 'next/app';
import { Modal } from '@navikt/ds-react';
import { ApolloClient, ApolloProvider, InMemoryCache, NormalizedCacheObject } from '@apollo/client';
import { Provider } from 'react-redux';

import ErrorBoundary from '../components/shared/ErrorBoundary/ErrorBoundary';
import { PrefetchResults } from '../shared/types';
import { useHandleDecoratorClicks } from '../hooks/useBreadcrumbs';
import { cacheConfig } from '../graphql/apollo';
import { getPublicEnv } from '../utils/env';
import { store } from '../state/store';

const publicEnv = getPublicEnv();

interface AppProps extends Omit<NextAppProps, 'pageProps'> {
    pageProps: PropsWithChildren<unknown> & Partial<PrefetchResults>;
}

function createApolloClient(initialCache?: NormalizedCacheObject): ApolloClient<NormalizedCacheObject> {
    const cache = new InMemoryCache(cacheConfig);
    if (initialCache) {
        cache.restore(initialCache);
    }
    const client = new ApolloClient({
        uri: `${publicEnv.publicPath ?? ''}/api/graphql`,
        ssrMode: typeof window === 'undefined',
        cache,
    });

    return client;
}

function MyApp({ Component, pageProps }: AppProps): JSX.Element {
    useHandleDecoratorClicks();

    const [apolloClient] = useState(() => createApolloClient(pageProps.apolloCache));

    useEffect(() => {
        Modal.setAppElement?.('#__next');
    }, []);

    return (
        <ErrorBoundary>
            <Provider store={store}>
                <ApolloProvider client={apolloClient}>
                    <Component {...pageProps} />
                </ApolloProvider>
            </Provider>
        </ErrorBoundary>
    );
}

export default MyApp;

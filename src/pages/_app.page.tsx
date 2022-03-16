import '../style/global.css';

import React, { PropsWithChildren, useEffect, useState } from 'react';
import type { AppProps as NextAppProps } from 'next/app';
import { Modal } from '@navikt/ds-react';
import { ApolloClient, ApolloProvider, from, HttpLink, InMemoryCache, NormalizedCacheObject } from '@apollo/client';
import { Provider } from 'react-redux';

import ErrorBoundary from '../components/shared/errors/ErrorBoundary';
import { PrefetchResults } from '../shared/types';
import { useHandleDecoratorClicks } from '../hooks/useBreadcrumbs';
import { cacheConfig, errorLink } from '../graphql/apollo';
import { getPublicEnv } from '../utils/env';
import { store } from '../state/store';

const publicEnv = getPublicEnv();

interface AppProps extends Omit<NextAppProps, 'pageProps'> {
    pageProps: PropsWithChildren<unknown> & Partial<PrefetchResults>;
}

function createApolloClient(initialCache?: NormalizedCacheObject): ApolloClient<NormalizedCacheObject> {
    const cache = new InMemoryCache(cacheConfig);
    const httpLink = new HttpLink({
        uri: `${publicEnv.publicPath ?? ''}/api/graphql`,
    });
    if (initialCache) {
        cache.restore(initialCache);
    }
    const client = new ApolloClient({
        ssrMode: typeof window === 'undefined',
        cache,
        link: from([errorLink, httpLink]),
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

import React, { PropsWithChildren, useEffect, useState } from 'react';
import type { AppProps as NextAppProps } from 'next/app';
import { Modal } from '@navikt/ds-react';
import { ApolloClient, ApolloProvider, InMemoryCache, NormalizedCacheObject } from '@apollo/client';

import { PrefetchResults } from '../shared/types';
import { useHandleDecoratorClicks } from '../hooks/useBreadcrumbs';
import StateProvider from '../components/shared/StateProvider';
import { cacheConfig } from '../graphql/apollo';

import '../style/global.css';

interface AppProps extends Omit<NextAppProps, 'pageProps'> {
    pageProps: PropsWithChildren<unknown> & Partial<PrefetchResults>;
}

function createApolloClient(initialCache?: NormalizedCacheObject): ApolloClient<NormalizedCacheObject> {
    const cache = new InMemoryCache(cacheConfig);
    if (initialCache) {
        cache.restore(initialCache);
    }
    const client = new ApolloClient({
        uri: `${process.env.NEXT_PUBLIC_BASE_PATH ?? ''}/api/graphql`,
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
        <StateProvider>
            <ApolloProvider client={apolloClient}>
                <Component {...pageProps} />
            </ApolloProvider>
        </StateProvider>
    );
}

export default MyApp;

import '../style/global.css';

import React, { PropsWithChildren, useEffect, useState } from 'react';
import type { AppProps as NextAppProps } from 'next/app';
import { Modal } from '@navikt/ds-react';
import { ApolloProvider } from '@apollo/client';
import { Provider } from 'react-redux';

import ErrorBoundary from '../components/shared/errors/ErrorBoundary';
import { PrefetchResults } from '../shared/types';
import { useHandleDecoratorClicks } from '../hooks/useBreadcrumbs';
import { createClientApolloClient } from '../graphql/apollo';
import { store } from '../state/store';
import metadataSlice from '../state/metadataSlice';
import { PAGE_SIZE_KEY, paginationSlice } from '../state/paginationSlice';
import UnsupportedBrowser from '../components/UserWarnings/UnsupportedBrowser/UnsupportedBrowser';
import LoggedOut from '../components/UserWarnings/LoggedOut/LoggedOut';

export interface AppProps extends Omit<NextAppProps, 'pageProps'> {
    pageProps: PropsWithChildren<unknown> & Partial<PrefetchResults>;
}

function MyApp({ Component, pageProps }: AppProps): JSX.Element {
    useHandleDecoratorClicks();
    useHandleVersion(pageProps.version);
    useHydratePageSize();

    const [apolloClient] = useState(() => createClientApolloClient(pageProps));

    useEffect(() => {
        Modal.setAppElement?.('#__next');
    }, []);

    return (
        <ErrorBoundary>
            <Provider store={store}>
                <ApolloProvider client={apolloClient}>
                    <LoggedOut />
                    {!pageProps.isIE ? <Component {...pageProps} /> : <UnsupportedBrowser />}
                </ApolloProvider>
            </Provider>
        </ErrorBoundary>
    );
}

function useHydratePageSize(): void {
    useEffect(() => {
        const persistedPageSize = +(localStorage.getItem(PAGE_SIZE_KEY) ?? 5);
        store.dispatch(paginationSlice.actions.setPageSize(persistedPageSize));
    }, []);
}

function useHandleVersion(version: string | null | undefined): void {
    useEffect(() => {
        if (!version) return;

        store.dispatch(metadataSlice.actions.setVersion(version));
    }, [version]);
}

export default MyApp;

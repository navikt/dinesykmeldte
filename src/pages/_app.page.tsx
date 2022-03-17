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

interface AppProps extends Omit<NextAppProps, 'pageProps'> {
    pageProps: PropsWithChildren<unknown> & Partial<PrefetchResults>;
}

function MyApp({ Component, pageProps }: AppProps): JSX.Element {
    useHandleDecoratorClicks();

    const [apolloClient] = useState(() => createClientApolloClient(pageProps.apolloCache));

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

import React, { PropsWithChildren, useEffect, useState } from 'react';
import type { AppProps as NextAppProps, NextWebVitalsMetric } from 'next/app';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';
import { DehydratedState, Hydrate } from 'react-query/hydration';

import { initialiseOnErrorLogger, logger } from '../utils/logger';
import '../style/global.css';

interface AppProps extends Omit<NextAppProps, 'pageProps'> {
    pageProps: PropsWithChildren<unknown> & {
        dehydratedState: DehydratedState;
    };
}

function MyApp({ Component, pageProps }: AppProps): JSX.Element {
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        /* Setting this to true causes the request to be immediately executed after initial
                           mount Even if the query had data hydrated from the server side render */
                        refetchOnMount: false,
                    },
                },
            }),
    );

    useEffect(() => {
        initialiseOnErrorLogger();
    }, []);

    return (
        <QueryClientProvider client={queryClient}>
            <Hydrate state={pageProps.dehydratedState}>
                <Component {...pageProps} />
            </Hydrate>
            <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
    );
}

export function reportWebVitals(metric: NextWebVitalsMetric): void {
    if (metric.label === 'web-vital') {
        logger.info(metric);
    }
}

export default MyApp;

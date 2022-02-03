import React, { PropsWithChildren, ReactElement, useEffect } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { Hydrate, QueryClient, QueryClientProvider, setLogger } from 'react-query';
import nock from 'nock';
import { GetServerSidePropsContext } from 'next';
import { DehydratedState } from 'react-query/hydration';

import { PrefetchResults } from '../../shared/types';
import StateProvider from '../../components/shared/StateProvider';
import { logger } from '../logger';

function customNock(): nock.Scope {
    const basePath = process.env.NEXT_PUBLIC_BASE_PATH;
    if (!basePath) {
        throw new Error('No BASE_PATH set, tests will not work!');
    }
    return nock(basePath);
}

type ProviderProps = {
    state?: DehydratedState;
};

export type HappyPathSsrResult<T extends PrefetchResults = PrefetchResults> = { props: T };

export function createMockedSsrContext(overrides?: Partial<GetServerSidePropsContext>): GetServerSidePropsContext {
    const request: GetServerSidePropsContext['req'] = {
        headers: {
            authorization: 'Bearer bW9ja2VkIHRva2Vu.eyAidGhpcyI6ICJpcyBhIGZha2Ugand0IHRva2VuIiB9',
        },
    } as GetServerSidePropsContext['req'];

    const response: GetServerSidePropsContext['res'] = {} as GetServerSidePropsContext['res'];

    return {
        req: request,
        res: response,
        query: {},
        resolvedUrl: '/dummy-url',
        ...overrides,
    };
}

function AllTheProviders({ state, children }: PropsWithChildren<ProviderProps>): JSX.Element {
    const testClient = new QueryClient({
        defaultOptions: {
            queries: {
                retry: false,
                refetchOnMount: false,
            },
        },
    });

    useEffect(() => {
        setLogger(logger);
    }, []);

    return (
        <StateProvider>
            <QueryClientProvider client={testClient}>
                <Hydrate state={state}>{children}</Hydrate>
            </QueryClientProvider>
        </StateProvider>
    );
}

const customRender = (
    ui: ReactElement,
    options: Omit<RenderOptions, 'wrapper'> & ProviderProps = {},
): ReturnType<typeof render> => {
    const { state, ...renderOptions } = options;

    return render(ui, {
        wrapper: (props) => <AllTheProviders {...props} state={state} />,
        ...renderOptions,
    });
};

export * from '@testing-library/react';
export { customRender as render, customNock as nock };

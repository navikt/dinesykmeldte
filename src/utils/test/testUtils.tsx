import React, { PropsWithChildren, ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { Hydrate, QueryClient, QueryClientProvider } from 'react-query';
import nock from 'nock';
import { GetServerSidePropsContext } from 'next';

import { PrefetchResults } from '../../shared/types';

function customNock(): nock.Scope {
    const basePath = process.env.NEXT_PUBLIC_BASE_PATH;
    if (!basePath) {
        throw new Error('No BASE_PATH set, tests will not work!');
    }
    return nock(basePath);
}

type ProviderProps = {
    state?: unknown;
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

function AllTheProviders({ state, children }: PropsWithChildren<ProviderProps>) {
    const testClient = new QueryClient({
        defaultOptions: {
            queries: {
                retry: false,
                refetchOnMount: false,
            },
        },
    });

    return (
        <QueryClientProvider client={testClient}>
            <Hydrate state={state}>{children}</Hydrate>
        </QueryClientProvider>
    );
}

const customRender = (ui: ReactElement, options: Omit<RenderOptions, 'wrapper'> & ProviderProps = {}) => {
    const { state, ...renderOptions } = options;

    return render(ui, {
        wrapper: (props) => <AllTheProviders {...props} state={state} />,
        ...renderOptions,
    });
};

export * from '@testing-library/react';
export { customRender as render, customNock as nock };

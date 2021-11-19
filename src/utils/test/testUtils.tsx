import React, { PropsWithChildren, ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from 'react-query';
import nock from 'nock';

function customNock(): nock.Scope {
    const basePath = process.env.NEXT_PUBLIC_BASE_PATH;
    if (!basePath) {
        throw new Error('No BASE_PATH set, tests will not work!');
    }
    return nock(basePath);
}

function AllTheProviders({ children }: PropsWithChildren<unknown>) {
    const testClient = new QueryClient({
        defaultOptions: {
            queries: {
                retry: false,
                refetchOnMount: false,
            },
        },
    });

    return <QueryClientProvider client={testClient}>{children}</QueryClientProvider>;
}

const customRender = (ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) =>
    render(ui, { wrapper: AllTheProviders, ...options });

export * from '@testing-library/react';
export { customRender as render, customNock as nock };

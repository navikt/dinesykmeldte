import React, { PropsWithChildren, ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { MockedProvider, MockedResponse } from '@apollo/client/testing';
import { Cache, InMemoryCache } from '@apollo/client';

import StateProvider from '../../components/shared/StateProvider';
import { cacheConfig } from '../../graphql/apollo';

type ProviderProps = {
    readonly initialState?: Cache.WriteQueryOptions<unknown, unknown>[];
    readonly mocks?: MockedResponse[];
};

function AllTheProviders({ initialState, mocks, children }: PropsWithChildren<ProviderProps>): JSX.Element {
    const cache = new InMemoryCache(cacheConfig);
    initialState?.forEach((it) => cache.writeQuery(it));

    return (
        <StateProvider>
            <MockedProvider mocks={mocks} cache={cache}>
                {children}
            </MockedProvider>
        </StateProvider>
    );
}

const customRender = (
    ui: ReactElement,
    options: Omit<RenderOptions, 'wrapper'> & ProviderProps = {},
): ReturnType<typeof render> => {
    const { initialState, mocks, ...renderOptions } = options;

    return render(ui, {
        wrapper: (props) => <AllTheProviders {...props} initialState={initialState} mocks={mocks} />,
        ...renderOptions,
    });
};

export * from '@testing-library/react';
export { customRender as render };

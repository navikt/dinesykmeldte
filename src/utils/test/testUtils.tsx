import React, { PropsWithChildren, ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { MockedProvider, MockedResponse } from '@apollo/client/testing';
import { Cache, InMemoryCache } from '@apollo/client';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';

import { cacheConfig } from '../../graphql/apollo';
import { AppStore, rootReducer } from '../../state/store';

type ProviderProps = {
    readonly initialState?: Cache.WriteQueryOptions<unknown, unknown>[];
    readonly mocks?: MockedResponse[];
    readonly store?: AppStore;
};

function AllTheProviders({ initialState, mocks, children, store }: PropsWithChildren<ProviderProps>): JSX.Element {
    const reduxStore = store ?? createTestStore();
    const cache = new InMemoryCache(cacheConfig);
    initialState?.forEach((it) => cache.writeQuery(it));

    return (
        <Provider store={reduxStore}>
            <MockedProvider mocks={mocks} cache={cache}>
                {children}
            </MockedProvider>
        </Provider>
    );
}

function customRender(
    ui: ReactElement,
    options: Omit<RenderOptions, 'wrapper'> & ProviderProps = {},
): ReturnType<typeof render> {
    const { initialState, mocks, store, ...renderOptions } = options;

    return render(ui, {
        wrapper: (props) => <AllTheProviders {...props} initialState={initialState} mocks={mocks} store={store} />,
        ...renderOptions,
    });
}

export function createTestStore(): AppStore {
    return configureStore({ reducer: rootReducer });
}

export * from '@testing-library/react';
export { customRender as render };

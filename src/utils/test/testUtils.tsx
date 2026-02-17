import { ApolloLink, type Cache, InMemoryCache } from "@apollo/client";
import { onError } from "@apollo/client/link/error";
import {
  MockedProvider,
  type MockedResponse,
  MockLink,
} from "@apollo/client/testing";
import { logger } from "@navikt/next-logger";
import { configureStore } from "@reduxjs/toolkit";
import {
  type RenderOptions,
  render,
  type Screen,
  screen,
} from "@testing-library/react";
import { MemoryRouterProvider } from "next-router-mock/MemoryRouterProvider";
import open from "open";
import type { PropsWithChildren, ReactElement } from "react";
import { Provider } from "react-redux";
import { cacheConfig } from "../../graphql/apollo";
import { type AppStore, rootReducer } from "../../state/store";

type ProviderProps = {
  readonly initialState?: Cache.WriteQueryOptions<unknown, unknown>[];
  readonly mocks?: MockedResponse[];
  readonly store?: AppStore;
};

const errorLoggingLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path, extensions }) => {
      if (extensions?.dontLog) {
        logger.error(
          "[GraphQL error]:" +
            `Message: ${message},` +
            `Location: ${locations},` +
            `Path: ${path}`,
        );
      }
    });
  }

  if (networkError) {
    logger.error(`[Network error]: ${networkError}`);
  }
});

function AllTheProviders({
  initialState,
  mocks,
  children,
  store,
}: PropsWithChildren<ProviderProps>): ReactElement {
  const mockLink = new MockLink(mocks ?? []);
  const link = ApolloLink.from([errorLoggingLink, mockLink]);

  const reduxStore = store ?? createTestStore();
  const cache = new InMemoryCache(cacheConfig);
  initialState?.forEach((it) => cache.writeQuery(it));

  return (
    <MemoryRouterProvider>
      <Provider store={reduxStore}>
        <MockedProvider link={link} mocks={mocks} cache={cache}>
          {children}
        </MockedProvider>
      </Provider>
    </MemoryRouterProvider>
  );
}

function customRender(
  ui: ReactElement,
  options: Omit<RenderOptions, "wrapper"> & ProviderProps = {},
): ReturnType<typeof render> {
  const { initialState, mocks, store, ...renderOptions } = options;

  return render(ui, {
    wrapper: (props) => (
      <AllTheProviders
        {...props}
        initialState={initialState}
        mocks={mocks}
        store={store}
      />
    ),
    ...renderOptions,
  });
}

export function createTestStore(): AppStore {
  return configureStore({ reducer: rootReducer });
}

async function openPlayground(screen: Screen): Promise<void> {
  await open(screen.logTestingPlaygroundURL());
}

const customScreen = {
  ...screen,
  openPlayground: () => openPlayground(screen),
};

export * from "@testing-library/react";
export { customRender as render, customScreen as screen };

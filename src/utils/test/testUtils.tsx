import {
  ApolloLink,
  type Cache,
  CombinedGraphQLErrors,
  InMemoryCache,
  type OperationVariables,
} from "@apollo/client";
import { ErrorLink } from "@apollo/client/link/error";
import { type MockedResponse, MockLink } from "@apollo/client/testing";
import { MockedProvider } from "@apollo/client/testing/react";
import { logger } from "@navikt/next-logger";
import { configureStore } from "@reduxjs/toolkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
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
  readonly initialState?: Cache.WriteQueryOptions<
    unknown,
    OperationVariables
  >[];
  readonly mocks?: MockedResponse[];
  readonly store?: AppStore;
  readonly cache?: InMemoryCache;
};

MockLink.defaultOptions = { delay: 0 };

const errorLoggingLink = new ErrorLink(({ error }) => {
  if (CombinedGraphQLErrors.is(error)) {
    error.errors.forEach(({ message, locations, path, extensions }) => {
      if (extensions?.dontLog) {
        logger.error(
          "[GraphQL error]:" +
            `Message: ${message},` +
            `Location: ${locations},` +
            `Path: ${path}`,
        );
      }
    });
  } else {
    logger.error(`[Network error]: ${error}`);
  }
});

function AllTheProviders({
  initialState,
  mocks,
  children,
  store,
  cache: providedCache,
}: PropsWithChildren<ProviderProps>): ReactElement {
  const mockLink = new MockLink(mocks ?? []);
  const link = ApolloLink.from([errorLoggingLink, mockLink]);

  const reduxStore = store ?? createTestStore();
  const cache = providedCache ?? new InMemoryCache(cacheConfig);
  initialState?.forEach((it) => {
    cache.writeQuery(it);
  });

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return (
    <MemoryRouterProvider>
      <Provider store={reduxStore}>
        <QueryClientProvider client={queryClient}>
          <MockedProvider
            link={link}
            mocks={mocks}
            cache={cache}
            defaultOptions={{
              watchQuery: { notifyOnNetworkStatusChange: false },
            }}
          >
            {children}
          </MockedProvider>
        </QueryClientProvider>
      </Provider>
    </MemoryRouterProvider>
  );
}

function customRender(
  ui: ReactElement,
  options: Omit<RenderOptions, "wrapper"> & ProviderProps = {},
): ReturnType<typeof render> {
  const { initialState, mocks, store, cache, ...renderOptions } = options;

  return render(ui, {
    wrapper: (props) => (
      <AllTheProviders
        {...props}
        initialState={initialState}
        mocks={mocks}
        store={store}
        cache={cache}
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

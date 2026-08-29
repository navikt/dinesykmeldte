"use client";
import { ApolloProvider } from "@apollo/client";
import { Theme } from "@navikt/ds-react";
import { configureLogger } from "@navikt/next-logger";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState } from "react";
import { Provider } from "react-redux";
import { createClientApolloClient } from "../../graphql/apollo";
import { useHandleDecoratorClicks } from "../../hooks/useBreadcrumbs";
import { ApmRouteTracker } from "../../observability/ApmRouteTracker";
import { forwardBrowserLogToApm } from "../../observability/browserLogger";
import { createQueryClient } from "../../queries/queryClient";
import { store } from "../../state/store";
import ErrorBoundary from "../shared/errors/ErrorBoundary";

configureLogger({
  basePath: process.env.NEXT_PUBLIC_BASE_PATH,
  onLog: forwardBrowserLogToApm,
});

export function AppProviders({ children }: { children: React.ReactNode }) {
  const [apolloClient] = useState(() => createClientApolloClient({}));
  const queryClient = createQueryClient();

  useHandleDecoratorClicks();

  return (
    <>
      <ApmRouteTracker />
      <ErrorBoundary>
        <Provider store={store}>
          <QueryClientProvider client={queryClient}>
            <ReactQueryDevtools initialIsOpen={false} />
            <ApolloProvider client={apolloClient}>
              <Theme>{children}</Theme>
            </ApolloProvider>
          </QueryClientProvider>
        </Provider>
      </ErrorBoundary>
    </>
  );
}

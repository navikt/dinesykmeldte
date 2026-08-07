"use client";
import { ApolloProvider } from "@apollo/client";
import { Theme } from "@navikt/ds-react";
import { configureLogger } from "@navikt/next-logger";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState } from "react";
import { Provider } from "react-redux";
import { faro, pinoLevelToFaroLevel } from "../../faro/faro";
import { createClientApolloClient } from "../../graphql/apollo";
import { useHandleDecoratorClicks } from "../../hooks/useBreadcrumbs";
import { createQueryClient } from "../../queries/queryClient";
import { store } from "../../state/store";
import ErrorBoundary from "../shared/errors/ErrorBoundary";

configureLogger({
  basePath: process.env.NEXT_PUBLIC_BASE_PATH,
  onLog: (log) =>
    faro?.api.pushLog(log.messages, {
      level: pinoLevelToFaroLevel(log.level.label),
    }),
});

export function AppProviders({ children }: { children: React.ReactNode }) {
  const [apolloClient] = useState(() => createClientApolloClient({}));
  const queryClient = createQueryClient();

  useHandleDecoratorClicks();

  return (
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
  );
}

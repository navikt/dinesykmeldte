"use client";

import { ApolloProvider } from "@apollo/client";
import { Theme } from "@navikt/ds-react";
import { configureLogger } from "@navikt/next-logger";
import { useState } from "react";
import { Provider } from "react-redux";
import { faro, pinoLevelToFaroLevel } from "../../faro/faro";
import { createClientApolloClient } from "../../graphql/apollo";
import { useHandleDecoratorClicks } from "../../hooks/useBreadcrumbs";
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
  useHandleDecoratorClicks();

  return (
    <ErrorBoundary>
      <Provider store={store}>
        <ApolloProvider client={apolloClient}>
          <Theme>{children}</Theme>
        </ApolloProvider>
      </Provider>
    </ErrorBoundary>
  );
}

"use client";

import { ApolloProvider } from "@apollo/client";
import { Theme } from "@navikt/ds-react";
import { configureLogger } from "@navikt/next-logger";
import { useState } from "react";
import { Provider } from "react-redux";
import { createClientApolloClient } from "../../graphql/apollo";
import { useHandleDecoratorClicks } from "../../hooks/useBreadcrumbs";
import { store } from "../../state/store";
import ErrorBoundary from "../shared/errors/ErrorBoundary";

export function AppProviders({ children }: { children: React.ReactNode }) {
  const [apolloClient] = useState(() => createClientApolloClient({}));
  useHandleDecoratorClicks();

  configureLogger({
    basePath: process.env.NEXT_PUBLIC_BASE_PATH,
  });

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

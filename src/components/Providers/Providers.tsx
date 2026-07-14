"use client";

import { ApolloProvider } from "@apollo/client";
import { Theme } from "@navikt/ds-react";
import { useState } from "react";
import { Provider } from "react-redux";
import { createClientApolloClient } from "../../graphql/apollo";
import { useHandleDecoratorClicks } from "../../hooks/useBreadcrumbs";
import { store } from "../../state/store";
import ErrorBoundary from "../shared/errors/ErrorBoundary";

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

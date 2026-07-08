"use client";

import { ApolloProvider } from "@apollo/client";
import { Theme } from "@navikt/ds-react";
import { useState } from "react";
import { Provider } from "react-redux";
import { createClientApolloClient } from "../graphql/apollo";
import { store } from "../state/store";

export function AppProviders({ children }: { children: React.ReactNode }) {
  const [apolloClient] = useState(() => createClientApolloClient({}));

  return (
    <Provider store={store}>
      <ApolloProvider client={apolloClient}>
        <Theme>{children}</Theme>
      </ApolloProvider>
    </Provider>
  );
}

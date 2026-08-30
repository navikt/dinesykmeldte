import { Page } from "@navikt/ds-react";
import { Component, type PropsWithChildren, type ReactNode } from "react";
import PageError from "./PageError";

interface State {
  hasError: boolean;
}

/**
 * Next 16 reports caught render errors through the root's console.error hook,
 * which @nais/apm captures. This boundary owns only the fallback UI.
 */
class ErrorBoundary extends Component<PropsWithChildren, State> {
  constructor(props: PropsWithChildren) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <Page>
          <Page.Block width="md" gutters>
            <PageError cause="Error boundary" />
          </Page.Block>
        </Page>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

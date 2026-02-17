import { Page } from "@navikt/ds-react";
import { logger } from "@navikt/next-logger";
import {
  Component,
  type ErrorInfo,
  type PropsWithChildren,
  type ReactNode,
} from "react";
import PageError from "./PageError";

interface State {
  hasError: boolean;
}

class ErrorBoundary extends Component<PropsWithChildren, State> {
  constructor(props: PropsWithChildren) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    logger.error({ error, errorInfo });
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

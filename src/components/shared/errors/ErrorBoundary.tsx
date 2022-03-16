import { Component, ErrorInfo, PropsWithChildren, ReactNode } from 'react';
import { ContentContainer } from '@navikt/ds-react';

import { registerClientMetric } from '../../../utils/clientMetric';
import { logger } from '../../../utils/logger';

import PageError from './PageError';

interface State {
    hasError: boolean;
}

class ErrorBoundary extends Component<PropsWithChildren<unknown>, State> {
    constructor(props: PropsWithChildren<unknown>) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(): State {
        return { hasError: true };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
        registerClientMetric({ type: 'boundary', path: window.location.pathname });
        logger.error({ error, errorInfo });
    }

    render(): ReactNode {
        if (this.state.hasError) {
            return (
                <ContentContainer>
                    <PageError />
                </ContentContainer>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;

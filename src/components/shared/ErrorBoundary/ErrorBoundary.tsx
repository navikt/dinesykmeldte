import { Component, ErrorInfo, PropsWithChildren, ReactNode } from 'react';
import { Alert, ContentContainer } from '@navikt/ds-react';

import { registerClientMetric } from '../../../utils/clientMetric';
import { logger } from '../../../utils/logger';

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
        registerClientMetric({ type: 'boundary' });
        logger.error({ error, errorInfo });
    }

    render(): ReactNode {
        if (this.state.hasError) {
            // TODO: Bedre design på dette
            return (
                <ContentContainer>
                    <Alert variant="error">Det har oppstådd en feil. Prøv på nytt senere.</Alert>
                </ContentContainer>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;

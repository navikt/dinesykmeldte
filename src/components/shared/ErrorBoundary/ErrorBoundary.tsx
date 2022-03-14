import { Component, ErrorInfo, PropsWithChildren, ReactNode } from 'react';

import { registerClientMetric } from '../../../utils/clientMetric';
import { logger } from '../../../utils/logger';

import FallbackError from './FallbackError';

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
            return <FallbackError />;
        }

        return this.props.children;
    }
}

export default ErrorBoundary;

import { useEffect } from 'react';
import type { AppProps, NextWebVitalsMetric } from 'next/app';

import { initialiseOnErrorLogger, logger } from '../utils/logger';

import '../style/global.css';

function MyApp({ Component, pageProps }: AppProps): JSX.Element {
    useEffect(() => {
        initialiseOnErrorLogger();
    }, []);

    return <Component {...pageProps} />;
}

export function reportWebVitals(metric: NextWebVitalsMetric): void {
    if (metric.label === 'web-vital') {
        logger.info(metric);
    }
}

export default MyApp;

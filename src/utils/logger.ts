/* eslint-disable @typescript-eslint/no-var-requires */

import {
    createFrontendLogger,
    createMockFrontendLogger,
    DEFAULT_FRONTENDLOGGER_API_URL,
    setUpErrorReporting,
} from '@navikt/frontendlogger';

type FrontendLogger = ReturnType<typeof createFrontendLogger>;

const getFrontendLogger = (): FrontendLogger =>
    process.env.NODE_ENV === 'production'
        ? createFrontendLogger('dinesykmeldte', DEFAULT_FRONTENDLOGGER_API_URL)
        : createMockFrontendLogger('dinesykmeldte');

const createBackendLogger = () =>
    require('pino')({
        prettyPrint: process.env.NODE_ENV !== 'production',
    });

export function initialiseOnErrorLogger(): void {
    if (process.env.NODE_ENV === 'production') {
        setUpErrorReporting(logger);
    }
}

export const logger = typeof window !== 'undefined' ? getFrontendLogger() : createBackendLogger();

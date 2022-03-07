import { collectDefaultMetrics, Counter, Histogram } from 'prom-client';

import { logger } from './utils/logger';

declare global {
    // eslint-disable-next-line no-var
    var _metrics: AppMetrics;
}

export class AppMetrics {
    constructor() {
        logger.info('Initializing metrics client');

        collectDefaultMetrics();
    }

    public backendApiDurationHistogram = new Histogram({
        name: 'dinesykmeldte_requests_duration_seconds',
        help: 'Load time for API call to dinesykmeldte-backend',
        labelNames: ['path'],
    });
    public pageInitialLoadCounter = new Counter({
        name: 'dinesykmeldte_request_counter',
        help: 'Number of requests',
        labelNames: ['path'],
    });
    public loginRedirect = new Counter({
        name: 'dinesykmeldte_login_redirect_counter',
        help: 'Requests redirected to wonderwall login',
        labelNames: ['path'],
    });
    public redirectToDialogmoter = new Counter({
        name: 'dinesykmeldte_redirect_dialogmoter_counter',
        help: 'Users proxying through to dialogmoter',
    });
    public dialogmoterMarkedAsRead = new Counter({
        name: 'dinesykmeldte_dialogmoter_marked_read_counter',
        help: 'Dialogmøter marked as read through proxy',
    });
    public dialogmoterMarkedAsReadFailed = new Counter({
        name: 'dinesykmeldte_dialogmoter_marked_read_failed_counter',
        help: 'Number of dialogmøter marking as read failed',
    });
    public pageError = new Counter({
        name: 'dinesykmeldte_page_error',
        help: 'Page error counts, 500, 404, etc',
        labelNames: ['type'],
    });
    public loggerWarnError = new Counter({
        name: 'dinesykmeldte_logger_error_warning_counter',
        help: 'Logger warnings and errors',
        labelNames: ['label'],
    });
    public tokenCacheCounter = new Counter({
        name: 'dinesykmeldte_token_cache_counter',
        help: 'Size of token cache',
    });
    public tokenFetchCounter = new Counter({
        name: 'dinesykmeldte_token_fetch_counter',
        help: 'Size of token cache',
        labelNames: ['where'],
    });
}

export type ClientMetrics =
    | { type: '500' }
    | { type: '404' }
    | { type: 'boundary' }
    | { type: 'info-page'; path: string };

global._metrics = global._metrics || new AppMetrics();

export default global._metrics;

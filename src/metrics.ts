import { collectDefaultMetrics, Counter, Histogram } from 'prom-client';
import { logger } from '@navikt/next-logger';

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
    public invalidToken = new Counter({
        name: 'dinesykmeldte_invalid_token_redirect_counter',
        help: 'Requests redirected to wonderwall login',
        labelNames: ['path'],
    });
    public apiUnauthorized = new Counter({
        name: 'dinesykmeldte_api_unauthorized_counter',
        help: 'Requests to API routes that are unauthorized',
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
    public oppfolgingsplanerMarkedAsRead = new Counter({
        name: 'dinesykmeldte_oppfolgingsplaner_marked_read_counter',
        help: 'Oppfolgingsplaner marked as read through proxy',
    });
    public dialogmoterMarkedAsReadFailed = new Counter({
        name: 'dinesykmeldte_dialogmoter_marked_read_failed_counter',
        help: 'Number of dialogmøter marking as read failed',
    });
    public oppfolgingsplanerMarkedAsReadFailed = new Counter({
        name: 'dinesykmeldte_oppfolgingsplaner_marked_read_failed_counter',
        help: 'Number of oppfolgingsplaner marking as read failed',
    });
    public pageError = new Counter({
        name: 'dinesykmeldte_page_error',
        help: 'Page error counts, 500, 404, etc',
        labelNames: ['type', 'path'],
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
    public versionCounter = new Counter({
        name: 'dinesykmeldte_version_counter',
        help: 'Users version',
        labelNames: ['version'],
    });
}

export type ClientMetrics =
    | { type: '500' }
    | { type: '404'; path: string }
    | { type: 'boundary'; path: string }
    | { type: 'info-page'; path: string };

global._metrics = global._metrics || new AppMetrics();

export default global._metrics;

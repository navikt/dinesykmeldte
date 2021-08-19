import * as Sentry from '@sentry/nextjs';

const SENTRY_DSN = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;

Sentry.init({
    dsn: SENTRY_DSN || 'https://1fc7557764e74f15afd7f445c0af3225@sentry.gc.nav.no/90',
    tracesSampleRate: 1.0,
    enabled: process.env.NODE_ENV === 'production',
    environment: process.env.NEXT_PUBLIC_ENVIRONMENT,
});

/* eslint-disable @typescript-eslint/no-var-requires */

const { withSentryConfig } = require('@sentry/nextjs');
const withTranspileModules = require('next-transpile-modules')([
    '@navikt/nav-dekoratoren-moduler',
    '@navikt/ds-react',
    '@navikt/ds-icons',
    '@navikt/frontendlogger',
]);

const SentryWebpackPluginOptions = {
    silent: true,
};

module.exports = withSentryConfig(
    withTranspileModules({
        basePath: process.env.NEXT_PUBLIC_BASE_PATH,
    }),
    SentryWebpackPluginOptions,
);

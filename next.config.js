/* eslint-disable @typescript-eslint/no-var-requires */

const { withSentryConfig } = require('@sentry/nextjs');
const withBundleAnalyzer = require('@next/bundle-analyzer')({
    enabled: process.env.ANALYZE === 'true',
});

const SentryWebpackPluginOptions = {
    silent: true,
};

module.exports = withBundleAnalyzer(
    withSentryConfig(
        {
            basePath: process.env.NEXT_PUBLIC_BASE_PATH,
        },
        SentryWebpackPluginOptions,
    ),
);

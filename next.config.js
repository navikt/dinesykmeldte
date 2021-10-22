/* eslint-disable @typescript-eslint/no-var-requires */

const { withSentryConfig } = require('@sentry/nextjs');
const withPlugins = require('next-compose-plugins');
const bundleAnalyzer = require('@next/bundle-analyzer');

module.exports = withPlugins(
    [
        [bundleAnalyzer, { enabled: process.env.ANALYZE === 'true' }],
        [
            (nextConfig) =>
                withSentryConfig(nextConfig, {
                    silent: true,
                    enabled: process.env.NODE_ENV === 'production',
                }),
        ],
    ],
    {
        basePath: process.env.NEXT_PUBLIC_BASE_PATH,
        publicRuntimeConfig: {
            publicPath: process.env.NEXT_PUBLIC_BASE_PATH,
            runtimeEnv: process.env.RUNTIME_ENVIRONMENT,
        },
    },
);

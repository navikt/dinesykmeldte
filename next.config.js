/* eslint-disable @typescript-eslint/no-var-requires */

const { withSentryConfig } = require('@sentry/nextjs');
const withPlugins = require('next-compose-plugins');
const withBundleAnalyzer = require('@next/bundle-analyzer')({
    enabled: process.env.ANALYZE === 'true',
});

module.exports = withPlugins(
    [
        [withBundleAnalyzer],
        [
            (nextConfig) =>
                process.env.ENABLE_SENTRY
                    ? withSentryConfig(nextConfig, {
                          silent: true,
                          enabled: process.env.NODE_ENV === 'production',
                      })
                    : nextConfig,
        ],
    ],
    {
        async rewrites() {
            return [
                {
                    source: '/dialogmoter/:sykmeldtId',
                    destination: '/api/dialogmoter-ferdigstille-proxy/:sykmeldtId',
                },
            ];
        },
        basePath: process.env.NEXT_PUBLIC_BASE_PATH,
        assetPrefix: process.env.ASSET_PREFIX,
        publicRuntimeConfig: {
            publicPath: process.env.NEXT_PUBLIC_BASE_PATH,
            runtimeEnv: process.env.RUNTIME_ENVIRONMENT,
        },
        pageExtensions: ['page.tsx', 'page.ts', 'api.ts'],
        experimental: {
            scrollRestoration: true,
        },
        eslint: {
            ignoreDuringBuilds: true,
            dirs: ['src'],
        },
    },
);

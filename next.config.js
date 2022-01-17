/* eslint-disable @typescript-eslint/no-var-requires */

const { withSentryConfig } = require('@sentry/nextjs');
const withPlugins = require('next-compose-plugins');
const withBundleAnalyzer = require('@next/bundle-analyzer')({
    enabled: process.env.ANALYZE === 'true',
});

module.exports = withPlugins(
    [
        [withBundleAnalyzer],
        //         [
        //             (nextConfig) =>
        //                 withSentryConfig(nextConfig, {
        //                     silent: true,
        //                     enabled: process.env.NODE_ENV === 'production',
        //                 }),
        //         ],
    ],
    {
        basePath: process.env.NEXT_PUBLIC_BASE_PATH,
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
        },
    },
);

/* eslint-disable @typescript-eslint/no-var-requires, @typescript-eslint/explicit-function-return-type */

const { withSentryConfig } = require('@sentry/nextjs')
const withBundleAnalyzer = require('@next/bundle-analyzer')({
    enabled: process.env.ANALYZE === 'true',
})

const witSentry = (nextConfig) =>
    process.env.ENABLE_SENTRY
        ? withSentryConfig(nextConfig, {
              silent: true,
              enabled: process.env.NODE_ENV === 'production' && !!process.env.ENABLE_SENTRY,
          })
        : nextConfig

const nextConfig = {
    async rewrites() {
        return [
            {
                source: '/',
                destination: '/null',
            },
            {
                source: '/sykmeldt/:sykmeldtId',
                destination: '/:sykmeldtId',
            },
            {
                source: '/dialogmoter/:sykmeldtId',
                destination: '/api/hendelser-ferdigstille-proxy/dialogmote/:sykmeldtId',
            },
            {
                source: '/oppfolgingsplaner/:sykmeldtId',
                destination: '/api/hendelser-ferdigstille-proxy/oppfolgingsplan/:sykmeldtId',
            },
        ]
    },
    basePath: process.env.NEXT_PUBLIC_BASE_PATH,
    assetPrefix: process.env.ASSET_PREFIX,
    publicRuntimeConfig: {
        publicPath: process.env.NEXT_PUBLIC_BASE_PATH,
        runtimeEnv: process.env.RUNTIME_ENVIRONMENT,
        amplitudeEnabled: process.env.AMPLITUDE_ENABLED,
    },
    pageExtensions: ['page.tsx', 'page.ts', 'api.ts'],
    experimental: {
        scrollRestoration: true,
    },
    eslint: {
        ignoreDuringBuilds: true,
        dirs: ['src'],
    },
}

module.exports = withBundleAnalyzer(witSentry(nextConfig))

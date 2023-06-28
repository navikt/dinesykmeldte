/* eslint-disable @typescript-eslint/no-var-requires, @typescript-eslint/explicit-function-return-type */

const withBundleAnalyzer = require('@next/bundle-analyzer')({
    enabled: process.env.ANALYZE === 'true',
})
const { buildCspHeader } = require('@navikt/nav-dekoratoren-moduler/ssr')

/**
 * @type {import('next').NextConfig}
 */

const appDirectives = {
    'default-src': ["'self'"],
    'script-src': ["'self'", "'unsafe-eval'", 'https://uxsignals-frontend.uxsignals.app.iterate.no'],
    'script-src-elem': ["'self'", 'https://uxsignals-frontend.uxsignals.app.iterate.no'],
    'style-src': ["'self'"],
    'img-src': ["'self'", 'data:'],
    'font-src': ["'self'", 'https://cdn.nav.no'],
    'worker-src': ["'self'"],
    'connect-src': ["'self'", 'https://*.nav.no', 'https://*.uxsignals.com'],
}

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
    async headers() {
        const environment = process.env.NEXT_PUBLIC_RUNTIME_ENVIRONMENT === 'prod' ? 'prod' : 'dev'
        const cspValue = await buildCspHeader(appDirectives, { env: environment })

        return [
            {
                source: '/:path*',
                headers: [
                    {
                        key: 'Content-Security-Policy',
                        value: cspValue,
                    },
                ],
            },
        ]
    },
    // Until jest supports ESM-modules, or we replace jest with vitest
    transpilePackages: ['nextleton'],
    output: 'standalone',
    reactStrictMode: true,
    basePath: process.env.NEXT_PUBLIC_BASE_PATH,
    assetPrefix: process.env.NEXT_PUBLIC_ASSET_PREFIX,
    publicRuntimeConfig: {
        publicPath: process.env.NEXT_PUBLIC_BASE_PATH,
        cdnPublicPath: process.env.NEXT_PUBLIC_ASSET_PREFIX
            ? `${process.env.ASSET_PREFIX}/public`
            : process.env.NEXT_PUBLIC_BASE_PATH ?? '',
        runtimeEnv: process.env.RUNTIME_ENVIRONMENT,
        amplitudeEnabled: process.env.AMPLITUDE_ENABLED,
        displayEgenmeldingsdager: process.env.DISPLAY_EGENMELDINGSDAGER,
    },
    pageExtensions: ['page.tsx', 'page.ts', 'api.ts'],
    experimental: {
        scrollRestoration: true,
    },
    eslint: {
        ignoreDuringBuilds: true,
        dirs: ['src'],
    },
    productionBrowserSourceMaps: true,
}

module.exports = withBundleAnalyzer(nextConfig)

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { buildCspHeader } = require('@navikt/nav-dekoratoren-moduler/ssr')

const appDirectives = {
    'default-src': ["'self'"],
    'script-src': ["'self'", "'unsafe-eval'", 'https://uxsignals-frontend.uxsignals.app.iterate.no'],
    'script-src-elem': ["'self'", 'https://uxsignals-frontend.uxsignals.app.iterate.no'],
    'style-src': ["'self'", "'unsafe-inline'"],
    'style-src-elem': ["'self'", "'unsafe-inline'"],
    'img-src': ["'self'", 'data:'],
    'font-src': ["'self'", 'https://cdn.nav.no'],
    'worker-src': ["'self'"],
    'connect-src': ["'self'", 'https://*.nav.no', 'https://*.uxsignals.com'],
}

/**
 * @type {import('next').NextConfig}
 */
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
    output: 'standalone',
    reactStrictMode: true,
    basePath: process.env.NEXT_PUBLIC_BASE_PATH,
    assetPrefix: process.env.NEXT_PUBLIC_ASSET_PREFIX,
    pageExtensions: ['page.tsx', 'page.ts', 'api.ts'],
    experimental: {
        optimizePackageImports: ['@navikt/aksel-icons', '@navikt/ds-react'],
        scrollRestoration: true,
    },
    serverExternalPackages: ['pino', 'pino-pretty', 'thread-stream'],
    productionBrowserSourceMaps: true,
}

module.exports = nextConfig

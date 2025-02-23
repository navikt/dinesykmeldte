import { GetServerSidePropsContext, NextApiRequest, NextApiResponse } from 'next'
import { UAParser } from 'ua-parser-js'
import { getToken, validateToken, parseIdportenToken } from '@navikt/oasis'
import { logger } from '@navikt/next-logger'

import { GetServerSidePropsPrefetchResult } from '../shared/types'
import { ResolverContextType } from '../graphql/resolvers/resolverTypes'
import { getServerEnv, isLocalOrDemo } from '../utils/env'
import metrics from '../metrics'
import { cleanPathForMetric } from '../utils/stringUtils'
import { getFlagsServerSide } from '../toggles/ssr'

type ApiHandler = (req: NextApiRequest, res: NextApiResponse) => Promise<unknown> | unknown
export type PageHandler = (
    context: GetServerSidePropsContext,
    version: string,
    isIE: boolean,
) => Promise<GetServerSidePropsPrefetchResult>

const PUBLIC_FILE = /\.(.*)$/

function shouldLogMetricForPath(cleanPath: string | undefined): boolean {
    if (!cleanPath) return false

    const hasFileExtension = PUBLIC_FILE.test(cleanPath)
    const isNextInternal = cleanPath.startsWith('/_next')

    return !hasFileExtension && !isNextInternal
}

const defaultPageHandler: PageHandler = async (context, version, isIE): Promise<GetServerSidePropsPrefetchResult> => {
    const flags = await getFlagsServerSide(context.req, context.res)

    return { props: { version, isIE, toggles: flags.toggles } }
}

/**
 * Used to authenticate Next.JS pages. Assumes application is behind
 * Wonderwall (https://doc.nais.io/security/auth/idporten/sidecar/). Will automatically redirect to login if
 * Wonderwall-cookie is missing.
 *
 */
export function withAuthenticatedPage(handler: PageHandler = defaultPageHandler) {
    return async function withBearerTokenHandler(
        context: GetServerSidePropsContext,
    ): Promise<ReturnType<NonNullable<typeof handler>>> {
        const version = getServerEnv().RUNTIME_VERSION
        const isIE = new UAParser(context.req.headers['user-agent']).getBrowser().name === 'IE'

        if (isLocalOrDemo) {
            logger.info(`Is running locally or in demo, skipping authentication for page for ${context.resolvedUrl}`)
            return handler(context, version, isIE)
        }

        const cleanPath = cleanPathForMetric(context.req.url)
        if (shouldLogMetricForPath(cleanPath)) {
            metrics.pageInitialLoadCounter.inc({ path: cleanPath }, 1)
        }

        const bearerToken = getToken(context.req)
        if (bearerToken == null) {
            metrics.loginRedirect.inc({ path: cleanPath }, 1)
            return {
                redirect: { destination: `/oauth2/login?redirect=${getRedirectPath(context)}`, permanent: false },
            }
        }

        const validationResult = await validateToken(bearerToken)
        if (!validationResult.ok) {
            metrics.invalidToken.inc({ path: cleanPath }, 1)
            const error = new Error(
                `Invalid JWT token found (${validationResult.errorType}) (cause: ${validationResult.errorType} ${validationResult.error.message}, redirecting to login.`,
                { cause: validationResult.error },
            )
            if (validationResult.errorType === 'token expired') {
                logger.warn(error)
            } else {
                logger.error(error)
            }
            return {
                redirect: { destination: `/oauth2/login?redirect=${getRedirectPath(context)}`, permanent: false },
            }
        }

        return handler(context, version, isIE)
    }
}

/**
 * Used to authenticate Next.JS pages. Assumes application is behind
 * Wonderwall (https://doc.nais.io/security/auth/idporten/sidecar/). Will deny requests if Wonderwall cookie is missing.
 */
export function withAuthenticatedApi(handler: ApiHandler): ApiHandler {
    return async function withBearerTokenHandler(req, res, ...rest) {
        if (isLocalOrDemo) {
            logger.info('Is running locally or in demo, skipping authentication for API')
            return handler(req, res, ...rest)
        }

        const token = getToken(req)
        if (token == null) {
            metrics.apiUnauthorized.inc({ path: cleanPathForMetric(req.url) }, 1)
            res.status(401).json({ message: 'Access denied' })
            return
        }

        const validationResult = await validateToken(token)
        if (!validationResult.ok) {
            const cleanPath = cleanPathForMetric(req.url)
            metrics.apiUnauthorized.inc({ path: cleanPath }, 1)
            logger.error(
                `Invalid JWT token found (${validationResult.errorType}) (cause: ${validationResult.error.message} for API ${cleanPath}`,
            )

            res.status(401).json({ message: 'Access denied' })
            return
        }

        const userVersion = req.headers['x-client-version'] as string | undefined
        // When proxying redirects for dialogmøter there is no user version header :)
        if (userVersion) {
            metrics.versionCounter.inc({ version: userVersion }, 1)
        }

        return handler(req, res, ...rest)
    }
}

/**
 * When using rewrites, nextjs sometimes prepend the basepath for some reason. When redirecting to auth
 * we need a clean URL to redirect the user back to the same page we are on.
 */
function getRedirectPath(context: GetServerSidePropsContext): string {
    const basePath = getServerEnv().publicPath
    const cleanUrl = context.resolvedUrl.replace(basePath ?? '', '')

    return cleanUrl.startsWith('/null')
        ? `${getServerEnv().publicPath ?? ''}/`
        : `${getServerEnv().publicPath ?? ''}${cleanUrl}`
}

/**
 * Creates the GraphQL context that is passed through the resolvers, both for prefetching and HTTP-fetching.
 */
export function createResolverContextType(
    req: GetServerSidePropsContext['req'] | NextApiRequest,
): ResolverContextType | null {
    if (isLocalOrDemo) {
        return require('./fakeLocalAuthTokenSet.json')
    }

    const token = getToken(req)
    if (!token) {
        return null
    }

    const payload = parseIdportenToken(token)
    const xRequestId = req.headers['x-request-id'] as string | undefined

    if (!payload.ok) {
        logger.error(`Failed to parse token: ${payload.error.message}`)
        return null
    }

    return {
        pid: payload.pid,
        accessToken: token,
        xRequestId: xRequestId,
    }
}

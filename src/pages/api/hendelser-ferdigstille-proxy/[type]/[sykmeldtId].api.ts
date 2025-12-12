import { GetServerSidePropsContext, NextApiRequest, NextApiResponse } from 'next'
import { logger } from '@navikt/next-logger'

import { browserEnv, isLocalOrDemo } from '../../../../utils/env'
import { createResolverContextType, withAuthenticatedApi } from '../../../../auth/withAuthentication'
import { MarkHendelseResolvedDocument } from '../../../../graphql/queries/graphql.generated'
import { createSsrApolloClient } from '../../../../graphql/prefetching'

const basePath = browserEnv.publicPath ?? ''

function logAndRedirect500(message: string, res: NextApiResponse): void {
    logger.error(message)
    res.redirect(`${basePath}/500`)
}

type HendelsesType = 'dialogmote' | 'oppfolgingsplan'

function parseParamsFromUrl(url: string | undefined): { type?: string; sykmeldtId?: string } {
    if (!url) return {}

    const pathWithoutQuery = url.split('?')[0]
    const segments = pathWithoutQuery.split('/').filter(Boolean)

    // Handle rewritten URL format: /dialogmoter/[sykmeldtId] or /oppfolgingsplaner/[sykmeldtId]
    // Next.js > 15.4 keeps the original URL in req.url, so we need to map it
    if (segments.length >= 2) {
        const firstSegment = segments[segments.length - 2]
        const secondSegment = segments[segments.length - 1]

        if (firstSegment === 'dialogmoter') {
            return { type: 'dialogmote', sykmeldtId: secondSegment }
        }
        if (firstSegment === 'oppfolgingsplaner') {
            return { type: 'oppfolgingsplan', sykmeldtId: secondSegment }
        }
    }

    // Fallback: try to find hendelser-ferdigstille-proxy pattern (original API route URL)
    const proxyIndex = segments.findIndex((s) => s === 'hendelser-ferdigstille-proxy')
    if (proxyIndex !== -1 && segments.length > proxyIndex + 2) {
        return {
            type: segments[proxyIndex + 1],
            sykmeldtId: segments[proxyIndex + 2],
        }
    }

    return {}
}

const handler = async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
    // Try to get params from query first, fall back to URL parsing (Next.js 16 rewrite issue workaround)
    let { sykmeldtId, type } = req.query
    const { source } = req.query

    logger.info(`Parsed params from req.query: type=${type}, sykmeldtId=${sykmeldtId}`)
    if (!type || !sykmeldtId) {
        const urlParams = parseParamsFromUrl(req.url)
        type = type || urlParams.type
        sykmeldtId = sykmeldtId || urlParams.sykmeldtId
        logger.info(`Parsed params from URL fallback: type=${urlParams.type}, sykmeldtId=${urlParams.sykmeldtId}`)
    }

    logger.info(`Hendelser proxy called with type=${type}, sykmeldtId=${sykmeldtId}`)

    const queryParams = (req.query.hendelser ?? null) as null | string | string[]

    if (!isValidQueryParams(queryParams)) {
        logAndRedirect500(`Malformed query params: ${JSON.stringify(queryParams)}`, res)
        return
    }

    if (!(type === 'dialogmote' || type === 'oppfolgingsplan')) {
        logAndRedirect500(`Invalid type: ${type}`, res)
        return
    }

    if (typeof sykmeldtId !== 'string') {
        logAndRedirect500(`Malformed sykmeldtId: ${sykmeldtId}, typeof: ${typeof sykmeldtId}`, res)
        return
    }

    const resolverContextType = createResolverContextType(req)
    if (!resolverContextType) {
        logAndRedirect500('User not logged in during hendelse proxy - createResolverContextType returned null', res)
        return
    }

    if (queryParams == null) {
        const redirectUrl = getRedirectUrl(sykmeldtId, type, source)
        logger.info(`No hendelseIds to resolve. Redirecting directly to: ${redirectUrl}`)
        res.redirect(redirectUrl)
        return
    }

    logger.info(
        `Marking the following hendelseIds as resolved: ${
            typeof queryParams === 'string' ? queryParams : queryParams.join(', ')
        }`,
    )
    try {
        const hendelseIds = typeof queryParams === 'string' ? [queryParams] : queryParams
        await Promise.all(hendelseIds.map((hendelseId) => markHendelseResolved(hendelseId, req)))
    } catch (error: unknown) {
        logger.error(`Failed to mark hendelser as resolved: ${error}`)
        res.redirect(`${basePath}/500`)
        return
    }

    const redirectUrl = getRedirectUrl(sykmeldtId, type, source)
    logger.info(`Successfully processed hendelser. Redirecting to: ${redirectUrl}`)
    res.redirect(redirectUrl)
}

function getRedirectUrl(sykmeldtId: string, type: HendelsesType, source?: string | string[]): string {
    if (type === 'dialogmote') {
        return getDialogmoterUrl(sykmeldtId) + createQueryParamIfPresent(source)
    } else if (type === 'oppfolgingsplan') {
        return getOppfolgingsplanUrl(sykmeldtId) + createQueryParamIfPresent(source)
    }

    throw new Error(`${type} is not a valid hendelse`)
}

function createQueryParamIfPresent(source?: string | string[]): string {
    if (!source) return ''

    if (Array.isArray(source)) {
        return `?source=${source.join('&source=')}`
    } else {
        return `?source=${source}`
    }
}
function getDialogmoterUrl(narmestelederId: string): string {
    if (isLocalOrDemo) {
        return `https://demo.ekstern.dev.nav.no/syk/dialogmoter/arbeidsgiver/${narmestelederId}`
    } else {
        return `/syk/dialogmoter/arbeidsgiver/${narmestelederId}`
    }
}

function isValidQueryParams(hendelser: string | string[] | null): hendelser is string[] | string | null {
    return hendelser === null || typeof hendelser === 'string' || Array.isArray(hendelser)
}

export function getOppfolgingsplanUrl(narmestelederId: string): string {
    if (isLocalOrDemo) {
        return `https://demo.ekstern.dev.nav.no/syk/oppfolgingsplaner/arbeidsgiver/${narmestelederId}`
    }

    return `/syk/oppfolgingsplaner/arbeidsgiver/${narmestelederId}`
}

async function markHendelseResolved(
    hendelseId: string,
    request: GetServerSidePropsContext['req'] | NextApiRequest,
): Promise<void> {
    const client = createSsrApolloClient(request)
    const result = await client.mutate({ mutation: MarkHendelseResolvedDocument, variables: { hendelseId } })

    if (result.errors) {
        throw result.errors[0]
    }
}

export default withAuthenticatedApi(handler)

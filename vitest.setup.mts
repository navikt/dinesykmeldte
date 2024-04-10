import 'vitest-dom/extend-expect'

import pretty from 'pino-pretty'
import { vi, expect, afterEach } from 'vitest'
import * as matchers from 'vitest-dom/matchers'
import mockRouter from 'next-router-mock'
import { createDynamicRouteParser } from 'next-router-mock/dynamic-routes'
import pino from 'pino'

import { cleanup } from './src/utils/test/testUtils'

vi.mock('@navikt/next-logger', async () => {
    const actual = (await vi.importActual('@navikt/next-logger')) satisfies typeof import('@navikt/next-logger')

    return {
        ...actual,
        logger: pino(pretty({ sync: true, minimumLevel: 'error' })),
    }
})

/** Patching some jsdom globals */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const dirtyGlobal = global as any

dirtyGlobal.scrollTo = vi.fn().mockImplementation(() => 0)
dirtyGlobal.HTMLElement.prototype.scrollIntoView = function () {}

expect.extend(matchers)

mockRouter.useParser(
    createDynamicRouteParser([
        '/sykmeldt/[sykmeldtId]',
        '/sykmeldt/[sykmeldtId]/soknader',
        '/sykmeldt/[sykmeldtId]/sykmeldinger',
        '/sykmeldt/[sykmeldtId]/soknad/[soknadId]',
        '/sykmeldt/[sykmeldtId]/sykmelding/[sykmeldingId]',
    ]),
)

// Custom rewrites to mimic the behaviour of the server
mockRouter.useParser((url) => {
    if (url.pathname === '/') {
        url.query.sykmeldtId = 'null'
    }
    if (url.pathname === '/sykmeldt/:sykmeldtId') {
        url.pathname = '/:sykmeldtId'
    }
    return url
})

vi.mock('graphql', () => vi.importActual('graphql/index.js'))
vi.mock('next/router', () => vi.importActual('next-router-mock'))
vi.mock('next/dist/client/router', () => vi.importActual('next-router-mock'))

// vitest doesn't do this automatically :)
afterEach(() => {
    cleanup()
})

process.env.DEBUG_PRINT_LIMIT = '30000'

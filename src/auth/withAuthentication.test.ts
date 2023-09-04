import { vi, describe, it, expect, beforeEach, Mock } from 'vitest'
import type { NextApiRequest, NextApiResponse } from 'next'
import { GetServerSidePropsContext } from 'next'
import * as nextAuth from '@navikt/next-auth-wonderwall'

import { GetServerSidePropsPrefetchResult } from '../shared/types'

import { PageHandler, withAuthenticatedApi, withAuthenticatedPage } from './withAuthentication'

vi.mock('../utils/env', () => ({
    getServerEnv: () => vi.fn(),
    isLocalOrDemo: false,
}))

vi.mock('openid-client', () => ({
    Issuer: {
        discover: vi.fn().mockImplementation(() => ({
            metadata: { jwks_uri: 'http://exmaple.com/fake-jwks-uri' },
        })),
    },
}))

vi.mock('@navikt/next-auth-wonderwall', () => ({
    validateIdportenToken: vi.fn(),
}))

const mockedValidateIdportenToken = nextAuth.validateIdportenToken as unknown as Mock<
    [ReturnType<typeof nextAuth.validateIdportenToken>]
>

describe('withAuthentication', () => {
    beforeEach(() => {
        vi.restoreAllMocks()
    })

    describe('withAuthenticatedPage', () => {
        const expectedLoginRedirect = '/oauth2/login?redirect=/fake/basepath/test-url'

        it('should redirect to login when token is missing', async () => {
            const handler: PageHandler = vi.fn()
            const fakeContext = createFakeContext(null)
            const result: GetServerSidePropsPrefetchResult = await withAuthenticatedPage(handler)(fakeContext)

            expect.assertions(2)
            if ('redirect' in result) {
                expect(result.redirect.destination).toEqual(expectedLoginRedirect)
            }
            expect(handler).not.toHaveBeenCalled()
        })

        it('should redirect to login when token is expired', async () => {
            mockedValidateIdportenToken.mockImplementation(async () => ({
                errorType: 'EXPIRED',
                message: 'token is expired',
            }))

            const handler: PageHandler = vi.fn()
            const fakeContext = createFakeContext()
            const result: GetServerSidePropsPrefetchResult = await withAuthenticatedPage(handler)(fakeContext)

            expect.assertions(2)
            if ('redirect' in result) {
                expect(result.redirect.destination).toEqual(expectedLoginRedirect)
            }
            expect(handler).not.toHaveBeenCalled()
        })

        it('should redirect to login when token has wrong client id', async () => {
            mockedValidateIdportenToken.mockImplementation(async () => ({
                errorType: 'CLIENT_ID_MISMATCH',
                message: 'wrong client id',
            }))

            const handler: PageHandler = vi.fn()
            const fakeContext = createFakeContext()
            const result: GetServerSidePropsPrefetchResult = await withAuthenticatedPage(handler)(fakeContext)

            expect.assertions(2)
            if ('redirect' in result) {
                expect(result.redirect.destination).toEqual(expectedLoginRedirect)
            }
            expect(handler).not.toHaveBeenCalled()
        })

        it('should redirect to login when token is not Level4', async () => {
            mockedValidateIdportenToken.mockImplementation(async () => ({
                errorType: 'NOT_ACR_LEVEL4',
                message: 'not level4',
            }))

            const handler: PageHandler = vi.fn()
            const fakeContext = createFakeContext()
            const result: GetServerSidePropsPrefetchResult = await withAuthenticatedPage(handler)(fakeContext)

            expect.assertions(2)
            if ('redirect' in result) {
                expect(result.redirect.destination).toEqual(expectedLoginRedirect)
            }
            expect(handler).not.toHaveBeenCalled()
        })

        it('should invoke handler when everything is good', async () => {
            mockedValidateIdportenToken.mockImplementation(async () => 'valid')

            const handler: PageHandler = vi.fn()
            const fakeContext = createFakeContext()
            await withAuthenticatedPage(handler)(fakeContext)

            expect(handler).toHaveBeenCalled()
        })
    })

    describe('withAuthenticatedApi', () => {
        it('should give 401 when token is missing', async () => {
            const handler = vi.fn()
            const fakeRequest = createFakeReq(null)
            const fakeResponse = createFakeRes()
            await withAuthenticatedApi(handler)(fakeRequest, fakeResponse.res)

            expect(fakeResponse.mockStatus).toHaveBeenCalledWith(401)
            expect(fakeResponse.mockJson).toHaveBeenCalledWith({ message: 'Access denied' })
            expect(handler).not.toHaveBeenCalled()
        })

        it('should give 401 when token is expired', async () => {
            mockedValidateIdportenToken.mockImplementation(async () => ({
                errorType: 'EXPIRED',
                message: 'token is expired',
            }))

            const handler = vi.fn()
            const fakeRequest = createFakeReq()
            const fakeResponse = createFakeRes()
            await withAuthenticatedApi(handler)(fakeRequest, fakeResponse.res)

            expect(fakeResponse.mockStatus).toHaveBeenCalledWith(401)
            expect(fakeResponse.mockJson).toHaveBeenCalledWith({ message: 'Access denied' })
            expect(handler).not.toHaveBeenCalled()
        })

        it('should give 401 when token has wrong client_id', async () => {
            mockedValidateIdportenToken.mockImplementation(async () => ({
                errorType: 'CLIENT_ID_MISMATCH',
                message: 'wrong client id',
            }))

            const handler = vi.fn()
            const fakeRequest = createFakeReq()
            const fakeResponse = createFakeRes()
            await withAuthenticatedApi(handler)(fakeRequest, fakeResponse.res)

            expect(fakeResponse.mockStatus).toHaveBeenCalledWith(401)
            expect(fakeResponse.mockJson).toHaveBeenCalledWith({ message: 'Access denied' })
            expect(handler).not.toHaveBeenCalled()
        })

        it('should give 401 when token is not Level4', async () => {
            mockedValidateIdportenToken.mockImplementation(async () => ({
                errorType: 'NOT_ACR_LEVEL4',
                message: 'not level4',
            }))

            const handler = vi.fn()
            const fakeRequest = createFakeReq()
            const fakeResponse = createFakeRes()
            await withAuthenticatedApi(handler)(fakeRequest, fakeResponse.res)

            expect(fakeResponse.mockStatus).toHaveBeenCalledWith(401)
            expect(fakeResponse.mockJson).toHaveBeenCalledWith({ message: 'Access denied' })
            expect(handler).not.toHaveBeenCalled()
        })

        it('should invoke handler when everything is good', async () => {
            mockedValidateIdportenToken.mockImplementation(async () => 'valid')

            const handler = vi.fn()
            const fakeRequest = createFakeReq()
            const fakeResponse = createFakeRes()
            await withAuthenticatedApi(handler)(fakeRequest, fakeResponse.res)

            expect(fakeResponse.mockStatus).not.toHaveBeenCalled()
            expect(fakeResponse.mockJson).not.toHaveBeenCalled()
            expect(handler).toHaveBeenCalled()
        })
    })
})

const createFakeReq = (token: string | null = 'test-token'): NextApiRequest => {
    const req: Partial<NextApiRequest> = {
        headers: {
            authorization: token ?? undefined,
            'x-client-version': 'fake-test-version',
        },
    }

    return req as unknown as NextApiRequest
}

const createFakeRes = (): { res: NextApiResponse; mockStatus: Mock; mockJson: Mock } => {
    const mockStatus = vi.fn()
    const mockJson = vi.fn()
    const res: Partial<NextApiResponse> = {
        status: mockStatus.mockImplementation(() => ({
            json: mockJson,
        })),
        setHeader: vi.fn(),
    }

    return { res: res as unknown as NextApiResponse, mockStatus, mockJson }
}

const createFakeContext = (token?: string | null): GetServerSidePropsContext => {
    const context: Partial<GetServerSidePropsContext> = {
        req: createFakeReq(token),
        res: createFakeRes().res,
        resolvedUrl: '/fake/basepath/test-url',
    }

    return context as unknown as GetServerSidePropsContext
}

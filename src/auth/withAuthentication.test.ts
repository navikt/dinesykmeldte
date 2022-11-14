import type { NextApiRequest, NextApiResponse } from 'next'
import { GetServerSidePropsContext } from 'next'
import * as nextAuth from '@navikt/next-auth-wonderwall'

import type { PublicEnv } from '../utils/env'
import { GetServerSidePropsPrefetchResult } from '../shared/types'

import { PageHandler, withAuthenticatedApi, withAuthenticatedPage } from './withAuthentication'

jest.mock('../utils/env', () => ({
    isLocalOrDemo: false,
    getPublicEnv: (): PublicEnv => ({
        amplitudeEnabled: 'false',
        publicPath: undefined,
        runtimeEnv: 'test',
    }),
    getEnv: (key: string) => {
        switch (key) {
            case 'RUNTIME_VERSION':
                return 'test-version'
            case 'NEXT_PUBLIC_BASE_PATH':
                return '/test/base-path'
            default:
                throw new Error(`Unmocked env: ${key}`)
        }
    },
}))

jest.mock('openid-client', () => ({
    Issuer: {
        discover: jest.fn().mockImplementation(() => ({
            metadata: { jwks_uri: 'http://exmaple.com/fake-jwks-uri' },
        })),
    },
}))

jest.mock('@navikt/next-auth-wonderwall', () => ({
    validateIdportenToken: jest.fn(),
}))

const mockedValidateIdportenToken = nextAuth.validateIdportenToken as jest.Mock<
    ReturnType<typeof nextAuth.validateIdportenToken>
>

describe('withAuthentication', () => {
    beforeEach(() => {
        jest.restoreAllMocks()
    })

    describe('withAuthenticatedPage', () => {
        const expectedLoginRedirect = '/oauth2/login?redirect=/test/base-path/test-url'

        it('should redirect to login when token is missing', async () => {
            const handler: PageHandler = jest.fn()
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

            const handler: PageHandler = jest.fn()
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

            const handler: PageHandler = jest.fn()
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

            const handler: PageHandler = jest.fn()
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

            const handler: PageHandler = jest.fn()
            const fakeContext = createFakeContext()
            await withAuthenticatedPage(handler)(fakeContext)

            expect(handler).toHaveBeenCalled()
        })
    })

    describe('withAuthenticatedApi', () => {
        it('should give 401 when token is missing', async () => {
            const handler = jest.fn()
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

            const handler = jest.fn()
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

            const handler = jest.fn()
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

            const handler = jest.fn()
            const fakeRequest = createFakeReq()
            const fakeResponse = createFakeRes()
            await withAuthenticatedApi(handler)(fakeRequest, fakeResponse.res)

            expect(fakeResponse.mockStatus).toHaveBeenCalledWith(401)
            expect(fakeResponse.mockJson).toHaveBeenCalledWith({ message: 'Access denied' })
            expect(handler).not.toHaveBeenCalled()
        })

        it('should invoke handler when everything is good', async () => {
            mockedValidateIdportenToken.mockImplementation(async () => 'valid')

            const handler = jest.fn()
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

const createFakeRes = (): { res: NextApiResponse; mockStatus: jest.Mock; mockJson: jest.Mock } => {
    const mockStatus = jest.fn()
    const mockJson = jest.fn()
    const res: Partial<NextApiResponse> = {
        status: mockStatus.mockImplementation(() => ({
            json: mockJson,
        })),
    }

    return { res: res as unknown as NextApiResponse, mockStatus, mockJson }
}

const createFakeContext = (token?: string | null): GetServerSidePropsContext => {
    const context: Partial<GetServerSidePropsContext> = {
        req: createFakeReq(token),
        res: createFakeRes().res,
        resolvedUrl: '/test/base-path/test-url',
    }

    return context as unknown as GetServerSidePropsContext
}

import type { NextApiRequest, NextApiResponse } from 'next';
import type { JWTVerifyResult } from 'jose';
import * as jose from 'jose';
import { GetServerSidePropsContext } from 'next';

import type { PublicEnv } from '../utils/env';
import { GetServerSidePropsPrefetchResult } from '../shared/types';

import { PageHandler, withAuthenticatedApi, withAuthenticatedPage } from './withAuthentication';

jest.mock('../utils/env', () => ({
    isLocalOrDemo: false,
    getPublicEnv: (): PublicEnv => ({
        publicPath: undefined,
        runtimeEnv: 'test',
    }),
    getEnv: (key: string) => {
        switch (key) {
            case 'IDPORTEN_WELL_KNOWN_URL':
                return 'id-porten-well-known-url';
            case 'IDPORTEN_CLIENT_ID':
                return 'id-porten-client-id';
            case 'RUNTIME_VERSION':
                return 'test-version';
            case 'NEXT_PUBLIC_BASE_PATH':
                return '/test/base-path';
            default:
                throw new Error(`Unmocked env: ${key}`);
        }
    },
}));

jest.mock('openid-client', () => ({
    Issuer: {
        discover: jest.fn().mockImplementation(() => ({
            metadata: { jwks_uri: 'http://exmaple.com/fake-jwks-uri' },
        })),
    },
}));

jest.mock('jose', () => ({
    jwtVerify: jest.fn(),
    createRemoteJWKSet: jest.fn(),
}));

describe('withAuthentication', () => {
    describe('withAuthenticatedPage', () => {
        const expectedLoginRedirect = '/oauth2/login?redirect=/test/base-path/test-url';

        it('should redirect to login when token is missing', async () => {
            const handler: PageHandler = jest.fn();
            const fakeContext = createFakeContext(null);
            const result: GetServerSidePropsPrefetchResult = await withAuthenticatedPage(handler)(fakeContext);

            expect.assertions(2);
            if ('redirect' in result) {
                expect(result.redirect.destination).toEqual(expectedLoginRedirect);
            }
            expect(handler).not.toHaveBeenCalled();
        });

        it('should redirect to login when token is expired', async () => {
            const expiredJosePayload: Partial<JWTVerifyResult> = {
                payload: { exp: (Date.now() - 100) / 1000 },
            };

            // @ts-expect-error Mock does not exist on library types
            jose.jwtVerify.mockImplementation(() => expiredJosePayload);

            const handler: PageHandler = jest.fn();
            const fakeContext = createFakeContext();
            const result: GetServerSidePropsPrefetchResult = await withAuthenticatedPage(handler)(fakeContext);

            expect.assertions(2);
            if ('redirect' in result) {
                expect(result.redirect.destination).toEqual(expectedLoginRedirect);
            }
            expect(handler).not.toHaveBeenCalled();
        });

        it('should redirect to login when token has wrong client id', async () => {
            const wrongClientIdJosePayload: Partial<JWTVerifyResult> = {
                payload: { exp: (Date.now() + 1000) / 1000, client_id: 'wrong-id' },
            };

            // @ts-expect-error Mock does not exist on library types
            jose.jwtVerify.mockImplementation(() => wrongClientIdJosePayload);

            const handler: PageHandler = jest.fn();
            const fakeContext = createFakeContext();
            const result: GetServerSidePropsPrefetchResult = await withAuthenticatedPage(handler)(fakeContext);

            expect.assertions(2);
            if ('redirect' in result) {
                expect(result.redirect.destination).toEqual(expectedLoginRedirect);
            }
            expect(handler).not.toHaveBeenCalled();
        });

        it('should redirect to login when token is not Level4', async () => {
            const wrongClientIdJosePayload: Partial<JWTVerifyResult> = {
                payload: { exp: (Date.now() + 1000) / 1000, client_id: 'id-porten-client-id', acr: 'Level3' },
            };

            // @ts-expect-error Mock does not exist on library types
            jose.jwtVerify.mockImplementation(() => wrongClientIdJosePayload);

            const handler: PageHandler = jest.fn();
            const fakeContext = createFakeContext();
            const result: GetServerSidePropsPrefetchResult = await withAuthenticatedPage(handler)(fakeContext);

            expect.assertions(2);
            if ('redirect' in result) {
                expect(result.redirect.destination).toEqual(expectedLoginRedirect);
            }
            expect(handler).not.toHaveBeenCalled();
        });

        it('should invoke handler when everything is good', async () => {
            const wrongClientIdJosePayload: Partial<JWTVerifyResult> = {
                payload: { exp: (Date.now() + 1000) / 1000, client_id: 'id-porten-client-id', acr: 'Level4' },
            };

            // @ts-expect-error Mock does not exist on library types
            jose.jwtVerify.mockImplementation(() => wrongClientIdJosePayload);

            const handler: PageHandler = jest.fn();
            const fakeContext = createFakeContext();
            await withAuthenticatedPage(handler)(fakeContext);

            expect(handler).toHaveBeenCalled();
        });
    });

    describe('withAuthenticatedApi', () => {
        it('should give 401 when token is missing', async () => {
            const handler = jest.fn();
            const fakeRequest = createFakeReq(null);
            const fakeResponse = createFakeRes();
            await withAuthenticatedApi(handler)(fakeRequest, fakeResponse.res);

            expect(fakeResponse.mockStatus).toHaveBeenCalledWith(401);
            expect(fakeResponse.mockJson).toHaveBeenCalledWith({ message: 'Access denied' });
            expect(handler).not.toHaveBeenCalled();
        });

        it('should give 401 when token is expired', async () => {
            const expiredJosePayload: Partial<JWTVerifyResult> = {
                payload: { exp: (Date.now() - 100) / 1000 },
            };

            // @ts-expect-error Mock does not exist on library types
            jose.jwtVerify.mockImplementation(() => expiredJosePayload);

            const handler = jest.fn();
            const fakeRequest = createFakeReq();
            const fakeResponse = createFakeRes();
            await withAuthenticatedApi(handler)(fakeRequest, fakeResponse.res);

            expect(fakeResponse.mockStatus).toHaveBeenCalledWith(401);
            expect(fakeResponse.mockJson).toHaveBeenCalledWith({ message: 'Access denied' });
            expect(handler).not.toHaveBeenCalled();
        });

        it('should give 401 when token has wrong client_id', async () => {
            const wrongClientIdJosePayload: Partial<JWTVerifyResult> = {
                payload: { exp: (Date.now() + 1000) / 1000, client_id: 'wrong-id' },
            };

            // @ts-expect-error Mock does not exist on library types
            jose.jwtVerify.mockImplementation(() => wrongClientIdJosePayload);

            const handler = jest.fn();
            const fakeRequest = createFakeReq();
            const fakeResponse = createFakeRes();
            await withAuthenticatedApi(handler)(fakeRequest, fakeResponse.res);

            expect(fakeResponse.mockStatus).toHaveBeenCalledWith(401);
            expect(fakeResponse.mockJson).toHaveBeenCalledWith({ message: 'Access denied' });
            expect(handler).not.toHaveBeenCalled();
        });

        it('should give 401 when token is not Level4', async () => {
            const wrongClientIdJosePayload: Partial<JWTVerifyResult> = {
                payload: { exp: (Date.now() + 1000) / 1000, client_id: 'id-porten-client-id', acr: 'Level3' },
            };

            // @ts-expect-error Mock does not exist on library types
            jose.jwtVerify.mockImplementation(() => wrongClientIdJosePayload);

            const handler = jest.fn();
            const fakeRequest = createFakeReq();
            const fakeResponse = createFakeRes();
            await withAuthenticatedApi(handler)(fakeRequest, fakeResponse.res);

            expect(fakeResponse.mockStatus).toHaveBeenCalledWith(401);
            expect(fakeResponse.mockJson).toHaveBeenCalledWith({ message: 'Access denied' });
            expect(handler).not.toHaveBeenCalled();
        });

        it('should invoke handler when everything is good', async () => {
            const wrongClientIdJosePayload: Partial<JWTVerifyResult> = {
                payload: { exp: (Date.now() + 1000) / 1000, client_id: 'id-porten-client-id', acr: 'Level4' },
            };

            // @ts-expect-error Mock does not exist on library types
            jose.jwtVerify.mockImplementation(() => wrongClientIdJosePayload);

            const handler = jest.fn();
            const fakeRequest = createFakeReq();
            const fakeResponse = createFakeRes();
            await withAuthenticatedApi(handler)(fakeRequest, fakeResponse.res);

            expect(fakeResponse.mockStatus).not.toHaveBeenCalled();
            expect(fakeResponse.mockJson).not.toHaveBeenCalled();
            expect(handler).toHaveBeenCalled();
        });
    });
});

const createFakeReq = (token: string | null = 'test-token'): NextApiRequest => {
    const req: Partial<NextApiRequest> = {
        headers: {
            authorization: token ?? undefined,
            'x-client-version': 'fake-test-version',
        },
    };

    return req as unknown as NextApiRequest;
};

const createFakeRes = (): { res: NextApiResponse; mockStatus: jest.Mock; mockJson: jest.Mock } => {
    const mockStatus = jest.fn();
    const mockJson = jest.fn();
    const res: Partial<NextApiResponse> = {
        status: mockStatus.mockImplementation(() => ({
            json: mockJson,
        })),
    };

    return { res: res as unknown as NextApiResponse, mockStatus, mockJson };
};

const createFakeContext = (token?: string | null): GetServerSidePropsContext => {
    const context: Partial<GetServerSidePropsContext> = {
        req: createFakeReq(token),
        res: createFakeRes().res,
        resolvedUrl: '/test/base-path/test-url',
    };

    return context as unknown as GetServerSidePropsContext;
};

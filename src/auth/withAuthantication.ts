import { IncomingMessage } from 'http';

import { NextApiResponse, NextPageContext } from 'next';
import { NextRequest } from '@sentry/nextjs/dist/utils/instrumentServer';

import { logger } from '../utils/logger';
import { GetServerSidePropsPrefetchResult } from '../shared/types';
import { ResolverContextType } from '../graphql/resolvers/resolverTypes';

type ApiHandler = (req: NextRequest, res: NextApiResponse) => void | Promise<unknown>;
type PageHandler = (context: NextPageContext) => void | Promise<GetServerSidePropsPrefetchResult>;

export interface TokenPayload {
    sub: string;
    iss: string;
    client_amr: string;
    pid: string;
    token_type: string;
    client_id: string;
    acr: string;
    scope: string;
    exp: string;
    iat: string;
    client_orgno: string;
    jti: string;
    consumer: {
        authority: string;
        ID: string;
    };
}

export function createResolverContextType(req: IncomingMessage): ResolverContextType | null {
    if (process.env.NODE_ENV === 'development') {
        return require('./fakeLocalAuthTokenSet.json');
    }

    const token = req.headers['authorization'];
    if (!token) {
        return null;
    }

    const jwtPayload = token.replace('Bearer ', '').split('.')[1];
    return {
        payload: JSON.parse(Buffer.from(jwtPayload, 'base64').toString()),
        accessToken: token.replace('Bearer ', ''),
    };
}

export function withAuthenticatedPage(handler: PageHandler) {
    return async function withIronSessionHandler(context: NextPageContext): Promise<ReturnType<typeof handler>> {
        if (process.env.NODE_ENV === 'development') {
            return handler(context);
        }

        const request = context.req;
        if (request == null) {
            throw new Error('Context is missing request. This should not happen');
        }

        const bearerToken: string | null | undefined = request.headers['authorization'];
        if (!bearerToken) {
            logger.info('Could not find any bearer token on the request. Redirecting to login.');

            return {
                redirect: {
                    destination: `/oauth2/login?redirect=/syk/dinesykmeldte`,
                    permanent: false,
                },
            };
        }

        return handler(context);
    };
}

export function withAuthenticatedApi(handler: ApiHandler): ApiHandler {
    return async function withIronSessionHandler(req, res, ...rest) {
        if (process.env.NODE_ENV === 'development') {
            return handler(req, res, ...rest);
        }

        const bearerToken: string | null | undefined = req.headers['authorization'];
        if (!bearerToken) {
            res.status(403).json({ message: 'Access denied' });
            return;
        }

        return handler(req, res, ...rest);
    };
}

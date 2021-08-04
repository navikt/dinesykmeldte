import { GetServerSidePropsContext, NextApiRequest, NextApiResponse } from 'next';
import { applySession as applyIronSession, Session } from 'next-iron-session';
import { TokenSet } from 'openid-client';

import { getEnv } from '../utils/env.server';
import { GetServerSidePropsPrefetchResult } from '../shared/types';
import { logger } from '../utils/logger';

export type NextIronRequest = NextApiRequest & { session: Session };
export type ServerSideContext = GetServerSidePropsContext & { req: NextIronRequest };

export type IronApiHandler = (req: NextIronRequest, res: NextApiResponse) => void | Promise<unknown>;
export type IronSsrHandler = (context: ServerSideContext) => void | Promise<GetServerSidePropsPrefetchResult>;

export async function applySession(
    req: NextApiRequest | GetServerSidePropsContext['req'],
    res: NextApiResponse | GetServerSidePropsContext['res'],
): Promise<void> {
    await applyIronSession(req, res, {
        password: getEnv('SECRET_COOKIE_PASSWORD'),
        cookieName: 'dine-sykmeldte-idporten',
        cookieOptions: {
            secure: process.env.NODE_ENV === 'production',
        },
    });
}

export function pullTokenSetFromRequest(req: NextIronRequest): TokenSet | null {
    if (!req.session) {
        throw new Error('No iron-session found. Did you forget to wrap your function with `withSession`?');
    }

    return req.session.get('tokenSet') ?? null;
}

export function withAuthenticatedPage(handler: IronSsrHandler) {
    return async function withIronSessionHandler(context: ServerSideContext): Promise<ReturnType<typeof handler>> {
        await applySession(context.req, context.res);

        const request = context.req as NextIronRequest | undefined;
        if (request?.session == null) {
            throw new Error('Session is undefined. This should not happen');
        }

        // If user is logged out or cookie has expired, redirect to login, but only during SSR.
        const tokenSet: TokenSet | string | null | undefined = request?.session?.get('tokenSet');
        if (!tokenSet) {
            logger.debug('Session exists, but token does not. Redirecting to login.');

            return {
                redirect: {
                    destination: `/api/login`,
                    permanent: false,
                },
            };
        }

        return handler(context);
    };
}

export function withAuthenticatedApi(handler: IronApiHandler): IronApiHandler {
    return async function withIronSessionHandler(req, res, ...rest) {
        await applySession(req, res);

        const request = req as NextIronRequest | undefined;
        if (request?.session == null) {
            throw new Error('Session is undefined. This should not happen');
        }

        const tokenSet: TokenSet | string | null | undefined = request?.session?.get('tokenSet');
        if (!tokenSet) {
            res.status(403).json({ message: 'Access denied' });
            return;
        }

        return handler(req, res, ...rest);
    };
}

import { IncomingMessage } from 'http';

import { GetServerSidePropsContext, NextApiRequest, NextApiResponse } from 'next';

import { logger } from '../utils/logger';
import { GetServerSidePropsPrefetchResult } from '../shared/types';
import { ResolverContextType } from '../graphql/resolvers/resolverTypes';
import { getEnv, isLocalOrDemo } from '../utils/env';
import metrics from '../metrics';
import { cleanPathForMetric } from '../utils/stringUtils';

import { validateToken } from './verifyIdportenToken';

type ApiHandler = (req: NextApiRequest, res: NextApiResponse) => void | Promise<unknown>;
type PageHandler = (context: GetServerSidePropsContext) => Promise<GetServerSidePropsPrefetchResult>;

const PUBLIC_FILE = /\.(.*)$/;

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

function shouldLogMetricForPath(cleanPath: string | undefined): boolean {
    if (!cleanPath) return false;

    const hasFileExtension = PUBLIC_FILE.test(cleanPath);
    const isNextInternal = cleanPath.startsWith('/_next');

    return !hasFileExtension && !isNextInternal;
}

/**
 * Used to authenticate Next.JS pages. Assumes application is behind
 * Wonderwall (https://doc.nais.io/security/auth/idporten/sidecar/). Will automatically redirect to login if
 * Wonderwall-cookie is missing.
 *
 */
export function withAuthenticatedPage(handler: PageHandler = async () => ({ props: {} })) {
    return async function withBearerTokenHandler(
        context: GetServerSidePropsContext,
    ): Promise<ReturnType<NonNullable<typeof handler>>> {
        if (isLocalOrDemo) {
            return handler(context);
        }

        const request = context.req;
        const cleanPath = cleanPathForMetric(request.url);
        if (shouldLogMetricForPath(cleanPath)) {
            metrics.pageInitialLoadCounter.inc({ path: cleanPath }, 1);
        }

        const bearerToken: string | null | undefined = request.headers['authorization'];
        if (!bearerToken || !(await validateToken(bearerToken))) {
            if (!bearerToken) {
                metrics.loginRedirect.inc({ path: cleanPath }, 1);
                logger.info('Could not find any bearer token on the request. Redirecting to login.');
            } else {
                metrics.invalidToken.inc({ path: cleanPath }, 1);
                logger.error('Invalid JWT token found, redirecting to login.');
            }

            return {
                redirect: {
                    destination: `/oauth2/login?redirect=${getEnv('NEXT_PUBLIC_BASE_PATH')}${
                        context.resolvedUrl ?? ''
                    }`,
                    permanent: false,
                },
            };
        }

        return handler(context);
    };
}

/**
 * Used to authenticate Next.JS pages. Assumes application is behind
 * Wonderwall (https://doc.nais.io/security/auth/idporten/sidecar/). Will deny requests if Wonderwall cookie is missing.
 */
export function withAuthenticatedApi(handler: ApiHandler): ApiHandler {
    return async function withBearerTokenHandler(req, res, ...rest) {
        if (isLocalOrDemo) {
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

/**
 * Creates the GraphQL context that is passed through the resolvers, both for prefetching and HTTP-fetching.
 */
export function createResolverContextType(req: IncomingMessage): ResolverContextType | null {
    if (isLocalOrDemo) {
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

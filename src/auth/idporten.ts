import { Session } from 'next-iron-session';
import { TokenSet } from 'openid-client';

import { getEnv } from '../utils/env.server';

import getIdportenClient from './idporten-client';
import { NextIronRequest } from './withSession';

export async function getAuthUrl(session: Session): Promise<string> {
    return (await getIdportenClient()).authorizationUrl({
        scope: 'openid profile',
        redirect_uri: getEnv('IDPORTEN_REDIRECT_URI'),
        response_type: 'code',
        response_mode: 'query',
        nonce: session.get('nonce'),
        state: session.get('state'),
        resource: 'https://nav.no',
        acr_values: 'Level4',
    });
}

export async function getTokenSet(req: NextIronRequest): Promise<TokenSet> {
    const idportenClient = await getIdportenClient();
    const params = idportenClient.callbackParams(req);
    const nonce = req.session.get('nonce');
    const state = req.session.get('state');
    const additionalClaims = {
        clientAssertionPayload: {
            aud: idportenClient.issuer.metadata.issuer,
        },
    };
    return idportenClient.callback(getEnv('IDPORTEN_REDIRECT_URI'), params, { nonce, state }, additionalClaims);
}

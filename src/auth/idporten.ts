import { Session } from 'next-iron-session';
import { idportenConfig } from '../utils/env';
import getIdportenClient from './idporten-client';
import { NextIronRequest } from './withSession';

export async function getAuthUrl(session: Session) {
    return (await getIdportenClient()).authorizationUrl({
        scope: 'openid profile',
        redirect_uri: idportenConfig.redirectUri,
        response_type: 'code',
        response_mode: 'query',
        nonce: session.get('nonce'),
        state: session.get('state'),
        resource: 'https://nav.no',
        acr_values: 'Level4',
    });
}

export async function getTokenSet(req: NextIronRequest) {
    const idportenClient = await getIdportenClient();
    const params = idportenClient.callbackParams(req);
    const nonce = req.session.get('nonce');
    const state = req.session.get('state');
    const additionalClaims = {
        clientAssertionPayload: {
            aud: idportenClient.issuer.metadata.issuer,
            // aud: idportenMetadata.metadata.issuer
        },
    };
    return idportenClient.callback(idportenConfig.redirectUri, params, { nonce, state }, additionalClaims);
}

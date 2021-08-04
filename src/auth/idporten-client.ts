import { Client, Issuer } from 'openid-client';

import { getEnv, getEnvObject } from '../utils/env.server';

let idportenClient: Client | null = null;

export default async function getIdportenClient(): Promise<Client> {
    if (idportenClient != null) {
        return idportenClient;
    }

    const idportenMetadata = await Issuer.discover(getEnv('IDPORTEN_WELL_KNOWN_URL'));
    idportenClient = new idportenMetadata.Client(
        {
            client_id: getEnv('IDPORTEN_CLIENT_ID'),
            token_endpoint_auth_method: 'private_key_jwt',
            token_endpoint_auth_signing_alg: 'RS256',
            redirect_uris: [getEnv('IDPORTEN_REDIRECT_URI'), 'http://localhost:3000/callback'], // TODO: remove localhost
            response_types: ['code'],
        },
        {
            keys: [getEnvObject('IDPORTEN_CLIENT_JWK')],
        },
    );

    return idportenClient;
}

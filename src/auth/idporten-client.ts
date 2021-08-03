import { Client, Issuer } from 'openid-client';
import { idportenConfig } from '../utils/env';

let idportenClient: Client | null = null;

export default async function getIdportenClient() {
    if (idportenClient != null) {
        return idportenClient;
    }

    const idportenMetadata = await Issuer.discover(idportenConfig.wellKnownUrl);
    idportenClient = new idportenMetadata.Client(
        {
            client_id: idportenConfig.clientId,
            token_endpoint_auth_method: 'private_key_jwt',
            token_endpoint_auth_signing_alg: 'RS256',
            redirect_uris: [idportenConfig.redirectUri, 'http://localhost:3000/callback'], // TODO: remove localhost
            response_types: ['code'],
        },
        {
            keys: [idportenConfig.clientJwk],
        },
    );

    return idportenClient;
}

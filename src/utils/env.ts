function getEnv(name: string): string {
    const envVar = process.env[name];
    if (!envVar) {
        throw new Error('something');
    }
    return envVar;
}

export const idportenConfig = {
    clientId: getEnv('IDPORTEN_CLIENT_ID'),
    clientJwk: JSON.parse(getEnv('IDPORTEN_CLIENT_JWK')), // TODO: maybe fix :)
    redirectUri: getEnv('IDPORTEN_REDIRECT_URI'),
    wellKnownUrl: getEnv('IDPORTEN_WELL_KNOWN_URL'),
};

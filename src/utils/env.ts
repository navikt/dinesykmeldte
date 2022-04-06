import getConfig from 'next/config';

export interface PublicEnv {
    publicPath: string | undefined;
    runtimeEnv: 'local' | 'test' | 'labs' | 'dev' | 'prod';
}

type AvailableEnv =
    | 'NEXT_PUBLIC_BASE_PATH'
    | 'DINE_SYKMELDTE_BACKEND_SCOPE'
    | 'DINE_SYKMELDTE_BACKEND_URL'
    | 'RUNTIME_ENVIRONMENT'
    | 'RUNTIME_VERSION'
    | 'TOKEN_X_CLIENT_ID'
    | 'TOKEN_X_PRIVATE_JWK'
    | 'TOKEN_X_WELL_KNOWN_URL'
    | 'IDPORTEN_CLIENT_ID'
    | 'IDPORTEN_WELL_KNOWN_URL';

export function getEnv(name: AvailableEnv): string {
    if (typeof window !== 'undefined') {
        throw new Error(`Illegal isomorphic access: Tried to access environment with name "${name}" on client side`);
    }

    const envVar = process.env[name];
    if (envVar == null) {
        throw new Error(`No key with name "${name}" found in environment`);
    }
    return envVar;
}

export function getPublicEnv(): PublicEnv {
    const { publicRuntimeConfig } = getConfig();

    return publicRuntimeConfig;
}

export const isLocalOrDemo = process.env.NODE_ENV !== 'production' || getPublicEnv().runtimeEnv === 'labs';

import getConfig from 'next/config';

export interface PublicEnv {
    publicPath: string;
    runtimeEnv: 'local' | 'test' | 'labs' | 'dev' | 'prod';
}

type AvailableEnv =
    | 'NEXT_PUBLIC_BASE_PATH'
    | 'DINE_SYKMELDTE_BACKEND_SCOPE'
    | 'DINE_SYKMELDTE_BACKEND_URL'
    | 'RUNTIME_ENVIRONMENT';

export function getEnvObject<T = never>(name: AvailableEnv): T {
    return JSON.parse(getEnv(name));
}

export function getEnv(name: AvailableEnv): string {
    if (process.browser) {
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

export const isDevOrDemo = process.env.NODE_ENV !== 'production' || process.env.RUNTIME_ENVIRONMENT === 'labs';

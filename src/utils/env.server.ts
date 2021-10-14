type AvailableEnv = '';

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

/**
 * These values must refer to `process.env` because next bundles `NEXT_PUBLIC_` values into
 * the javascript at build time
 */
export const publicConfig = {
    publicPath: process.env.NEXT_PUBLIC_BASE_PATH as string | undefined,
};

// Verify that all keys in publicConfig were correctly bundled
Object.entries(([key, value]: [key: string, value: string | undefined]) => {
    if (value == null) {
        throw new Error(`No key with name "${key}" found in environment`);
    }
});

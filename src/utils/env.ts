import { z, ZodError } from 'zod'

export type PublicEnv = z.infer<typeof publicEnvSchema>
export const publicEnvSchema = z.object({
    publicPath: z.union([z.string(), z.undefined()]),
    cdnPublicPath: z.union([z.string(), z.undefined()]),
    runtimeEnv: z.union([
        z.literal('local'),
        z.literal('test'),
        z.literal('demo'),
        z.literal('dev'),
        z.literal('prod'),
    ]),
    amplitudeEnabled: z.union([z.literal('false'), z.literal('true')]),
    version: z.string(),
    faroUrl: z.string().optional(),
})

export type ServerEnv = z.infer<typeof serverEnvSchema>
export const serverEnvSchema = z.object({
    DINE_SYKMELDTE_BACKEND_SCOPE: z.string(),
    DINE_SYKMELDTE_BACKEND_URL: z.string(),
    RUNTIME_VERSION: z.string(),
    FLEXJAR: z.string(),
    FLEXJAR_BACKEND_SCOPE: z.string(),
    // Provided my nais
    IDPORTEN_CLIENT_ID: z.string(),
    IDPORTEN_WELL_KNOWN_URL: z.string(),
    TOKEN_X_WELL_KNOWN_URL: z.string(),
    TOKEN_X_PRIVATE_JWK: z.string(),
    TOKEN_X_CLIENT_ID: z.string(),
    // for unleash
    UNLEASH_SERVER_API_URL: z.string().optional(),
    UNLEASH_SERVER_API_TOKEN: z.string().optional(),
})

/**
 * These envs are available in the browser. They are replaced during the bundling step by NextJS.
 *
 * They MUST be provided during the build step.
 */
export const browserEnv = publicEnvSchema.parse({
    publicPath: process.env.NEXT_PUBLIC_BASE_PATH,
    cdnPublicPath: process.env.NEXT_PUBLIC_ASSET_PREFIX
        ? `${process.env.NEXT_PUBLIC_ASSET_PREFIX}/public`
        : (process.env.NEXT_PUBLIC_BASE_PATH ?? ''),
    runtimeEnv: process.env.NEXT_PUBLIC_RUNTIME_ENVIRONMENT,
    amplitudeEnabled: process.env.NEXT_PUBLIC_AMPLITUDE_ENABLED,
    faroUrl: process.env.NEXT_PUBLIC_TELEMETRY_URL,
    version: process.env.NEXT_PUBLIC_VERSION,
} satisfies Record<keyof PublicEnv, string | undefined>)

const getRawServerConfig = (): Partial<unknown> =>
    ({
        // Provided by nais-*.yml
        DINE_SYKMELDTE_BACKEND_SCOPE: process.env.DINE_SYKMELDTE_BACKEND_SCOPE,
        DINE_SYKMELDTE_BACKEND_URL: process.env.DINE_SYKMELDTE_BACKEND_URL,
        RUNTIME_VERSION: process.env.RUNTIME_VERSION,
        FLEXJAR: process.env.FLEXJAR,
        FLEXJAR_BACKEND_SCOPE: process.env.FLEXJAR_BACKEND_SCOPE,
        // Provided by nais
        TOKEN_X_CLIENT_ID: process.env.TOKEN_X_CLIENT_ID,
        TOKEN_X_PRIVATE_JWK: process.env.TOKEN_X_PRIVATE_JWK,
        TOKEN_X_WELL_KNOWN_URL: process.env.TOKEN_X_WELL_KNOWN_URL,
        IDPORTEN_CLIENT_ID: process.env.IDPORTEN_CLIENT_ID,
        IDPORTEN_WELL_KNOWN_URL: process.env.IDPORTEN_WELL_KNOWN_URL,
        // for unleash
        UNLEASH_SERVER_API_URL: process.env.UNLEASH_SERVER_API_URL,
        UNLEASH_SERVER_API_TOKEN: process.env.UNLEASH_SERVER_API_TOKEN,
    }) satisfies Record<keyof ServerEnv, string | undefined>

/**
 * Server envs are lazy loaded and verified using Zod.
 */
export function getServerEnv(): ServerEnv & PublicEnv {
    try {
        return { ...serverEnvSchema.parse(getRawServerConfig()), ...publicEnvSchema.parse(browserEnv) }
    } catch (e) {
        if (e instanceof ZodError) {
            throw new Error(
                `The following envs are missing: ${
                    e.errors
                        .filter((it) => it.message === 'Required')
                        .map((it) => it.path.join('.'))
                        .join(', ') || 'None are missing, but zod is not happy. Look at cause'
                }`,
                { cause: e },
            )
        } else {
            throw e
        }
    }
}
export const isLocalOrDemo = process.env.NODE_ENV !== 'production' || browserEnv.runtimeEnv === 'demo'

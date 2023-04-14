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
    displayEgenmeldingsdager: z.union([z.literal('false'), z.literal('true')]),
})

export type ServerEnv = z.infer<typeof serverEnvSchema>
export const serverEnvSchema = z.object({
    DINE_SYKMELDTE_BACKEND_SCOPE: z.string(),
    DINE_SYKMELDTE_BACKEND_URL: z.string(),
    RUNTIME_VERSION: z.string(),
    // Provided my nais
    IDPORTEN_CLIENT_ID: z.string(),
    IDPORTEN_WELL_KNOWN_URL: z.string(),
    TOKEN_X_WELL_KNOWN_URL: z.string(),
    TOKEN_X_PRIVATE_JWK: z.string(),
    TOKEN_X_CLIENT_ID: z.string(),
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
        : process.env.NEXT_PUBLIC_BASE_PATH ?? '',
    runtimeEnv: process.env.NEXT_PUBLIC_RUNTIME_ENVIRONMENT,
    amplitudeEnabled: process.env.NEXT_PUBLIC_AMPLITUDE_ENABLED,
    displayEgenmeldingsdager: process.env.NEXT_PUBLIC_DISPLAY_EGENMELDINGSDAGER,
})

const getRawServerConfig = (): Partial<unknown> => ({
    // Provided by nais-*.yml
    DINE_SYKMELDTE_BACKEND_SCOPE: process.env.DINE_SYKMELDTE_BACKEND_SCOPE,
    DINE_SYKMELDTE_BACKEND_URL: process.env.DINE_SYKMELDTE_BACKEND_URL,
    RUNTIME_VERSION: process.env.RUNTIME_VERSION,
    // Provided by nais
    TOKEN_X_CLIENT_ID: process.env.TOKEN_X_CLIENT_ID,
    TOKEN_X_PRIVATE_JWK: process.env.TOKEN_X_PRIVATE_JWK,
    TOKEN_X_WELL_KNOWN_URL: process.env.TOKEN_X_WELL_KNOWN_URL,
    IDPORTEN_CLIENT_ID: process.env.IDPORTEN_CLIENT_ID,
    IDPORTEN_WELL_KNOWN_URL: process.env.IDPORTEN_WELL_KNOWN_URL,
})

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

export function isEgenmeldingsdagerEnabled(): boolean {
    return browserEnv.displayEgenmeldingsdager === 'true'
}

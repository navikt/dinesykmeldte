import { logger } from '@navikt/next-logger'

import { ClientMetrics } from '../metrics'

import { getPublicEnv } from './env'

const publicEnv = getPublicEnv()

export async function registerClientMetric(metric: ClientMetrics): Promise<void> {
    try {
        await fetch(`${publicEnv.publicPath ?? ''}/api/metrics`, {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify(metric),
        })
    } catch (e) {
        logger.warn('Unable to log client side metric')
    }
}

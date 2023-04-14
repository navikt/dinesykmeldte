import { logger } from '@navikt/next-logger'

import { ClientMetrics } from '../metrics'

import { browserEnv } from './env'

export async function registerClientMetric(metric: ClientMetrics): Promise<void> {
    try {
        await fetch(`${browserEnv.publicPath ?? ''}/api/metrics`, {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify(metric),
        })
    } catch (e) {
        logger.warn('Unable to log client side metric')
    }
}

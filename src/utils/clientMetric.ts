import { ClientMetrics } from '../metrics';

import { logger } from './logger';

export async function registerClientMetric(metric: ClientMetrics): Promise<void> {
    try {
        await fetch(`${process.env.NEXT_PUBLIC_BASE_PATH ?? ''}/api/metrics`, {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify(metric),
        });
    } catch (e) {
        logger.warn('Unable to log client side metric');
    }
}

import type { NextApiRequest, NextApiResponse } from 'next';

import metrics, { ClientMetrics } from '../../metrics';
import { cleanPathForMetric } from '../../utils/stringUtils';

const handler = (req: NextApiRequest, res: NextApiResponse): void => {
    const metric: ClientMetrics = req.body;

    switch (metric.type) {
        case '500':
            metrics.pageError.inc({ type: '500' });
            break;
        case '404':
            metrics.pageError.inc({ type: '404', path: cleanPathForMetric(metric.path) });
            break;
        case 'boundary':
            metrics.pageError.inc({ type: 'boundary', path: cleanPathForMetric(metric.path) });
            break;
        case 'info-page':
            metrics.pageInitialLoadCounter.inc({ path: cleanPathForMetric(metric.path) });
    }

    res.status(200).json({ ok: `ok` });
};

export default handler;

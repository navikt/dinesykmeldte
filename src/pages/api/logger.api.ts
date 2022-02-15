import type { NextApiRequest, NextApiResponse } from 'next';
import pino from 'pino';

import { logger } from '../../utils/logger';
import metrics from '../../metrics';

const handler = (req: NextApiRequest, res: NextApiResponse): void => {
    const { level, ts, ...rest }: pino.LogEvent = req.body;

    rest.messages.forEach((msg) => {
        const log = typeof msg === 'string' ? { msg } : msg;

        if (level.label === 'warn' || level.label === 'error') {
            metrics.loggerWarnError.inc({ label: level.label });
        }

        logger[level.label]({ ...log, x_timestamp: ts, x_isFrontend: true, x_userAgent: req.headers['user-agent'] });
    });

    res.status(200).json({ ok: `ok` });
};

export default handler;

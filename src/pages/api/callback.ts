import type { NextApiResponse } from 'next';

import { getTokenSet } from '../../auth/idporten';
import { applySession, NextIronRequest } from '../../auth/withSession';
import { publicConfig } from '../../utils/env.both';
import { logger } from '../../utils/logger';

const callback = async (req: NextIronRequest, res: NextApiResponse): Promise<void> => {
    await applySession(req, res);

    if (process.env.NODE_ENV === 'production') {
        const session = req.session;
        try {
            const tokenSet = await getTokenSet(req);
            session.set('tokenSet', tokenSet);
            session.unset('nonce');
            session.unset('state');
            await session.save();
            res.redirect(`${publicConfig.publicPath || '/'}`); // TODO: get redirect from request query params
        } catch (error) {
            // @ts-expect-error Missing typing for TypeScript 4.4s "unknown" errors
            logger.error(error);
            res.status(403);
        }
        return;
    }

    const session = req.session;
    const value = await import('../../auth/fakeLocalAuthTokenSet.json').then((it) => it.default);
    session.set('tokenSet', value);
    await session.save();
    res.redirect(`${publicConfig.publicPath || '/'}`); // TODO: get redirect from request query params
};

export default callback;

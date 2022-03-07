import NodeCache from 'node-cache';

import metrics from '../metrics';

declare global {
    // eslint-disable-next-line no-var
    var _tokenCache: NodeCache;
}

global._tokenCache = global._tokenCache || new NodeCache();

global._tokenCache.on('set', () => {
    metrics.tokenCacheCounter.inc(1);
});

export default global._tokenCache;

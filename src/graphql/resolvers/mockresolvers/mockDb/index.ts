import { isDevOrDemo } from '../../../../utils/env';

import { FakeMockDB } from './mockDb';

declare global {
    // eslint-disable-next-line no-var
    var mockDb: FakeMockDB;
}

if (isDevOrDemo || process.env.NODE_ENV === 'test') {
    global.mockDb = global.mockDb || new FakeMockDB();

    mockDb = global.mockDb;
} else {
    mockDb = new FakeMockDB();
}

export default mockDb;

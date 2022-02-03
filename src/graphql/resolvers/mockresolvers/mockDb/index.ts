import { FakeMockDB } from './mockDb';

declare global {
    // eslint-disable-next-line no-var
    var mockDb: FakeMockDB;
}

if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
    global.mockDb = global.mockDb || new FakeMockDB();

    mockDb = global.mockDb;
} else {
    mockDb = new FakeMockDB();
}

export default mockDb;

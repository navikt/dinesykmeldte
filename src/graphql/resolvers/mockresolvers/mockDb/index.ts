import { FakeMockDB } from './mockDb';

declare global {
    // eslint-disable-next-line no-var
    var mockDb: FakeMockDB;
}

/**
 * Whenever next.js hot-reloads, a new mock DB instance was created, meaning
 * that mutations were not persisted. Putting the MockDB on the global object
 * fixes this, but that only needs to be done when we are developing locally.
 */
if (process.env.NODE_ENV !== 'production') {
    global.mockDb = global.mockDb || new FakeMockDB();

    mockDb = global.mockDb;
} else {
    mockDb = new FakeMockDB();
}

export default mockDb;

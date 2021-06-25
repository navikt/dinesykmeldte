/* eslint-disable @typescript-eslint/no-var-requires */

export default process.env.NODE_ENV === 'production'
    ? require('./resolvers/rootResolver').default
    : require('./mockresolvers/mockResolvers').default;

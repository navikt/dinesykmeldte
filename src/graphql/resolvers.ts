import realResolvers from './resolvers/rootResolver';
import mockResolvers from './resolvers/mockresolvers/mockResolvers';

export default process.env.NODE_ENV === 'production' ? realResolvers : mockResolvers;

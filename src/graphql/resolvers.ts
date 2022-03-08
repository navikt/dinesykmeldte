import { isLocalOrDemo } from '../utils/env';

import realResolvers from './resolvers/rootResolver';
import mockResolvers from './resolvers/mockresolvers/mockResolvers';

export default isLocalOrDemo ? mockResolvers : realResolvers;

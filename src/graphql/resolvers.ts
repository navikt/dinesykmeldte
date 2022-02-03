import { isDevOrDemo } from '../utils/env';

import realResolvers from './resolvers/rootResolver';
import mockResolvers from './resolvers/mockresolvers/mockResolvers';

export default isDevOrDemo ? mockResolvers : realResolvers;

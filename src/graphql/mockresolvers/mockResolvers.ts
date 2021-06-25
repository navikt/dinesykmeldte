import { logger } from '../../utils/logger';

logger.warn('-- Using mock resolvers');

const Query = {
    foo: (): string => 'Mocked foo',
    qux: (): string => 'Mocked qux',
};

const resolvers = {
    Query,
};

export default resolvers;

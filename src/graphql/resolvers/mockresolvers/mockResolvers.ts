import { logger } from '../../../utils/logger';
import { QueryResolvers, Resolvers } from '../resolvers.generated';

logger.warn('-- Using mock resolvers');

const Query: QueryResolvers = {
    dineSykmeldte: () => [
        {
            uuid: '92ee1e67-da1b-4c02-bef0-e8738075ea97',
            navn: 'Testine B.',
            fodselsNummer: 'EL8PV',
        },
        {
            uuid: '8d211247-b3a4-447a-8500-4781f29208c9',
            navn: 'Testnas Y.',
            fodselsNummer: '89549300',
        },
    ],
    sykmeldinger: () => [{ dato: '2019-09-26T07:58:30.996+0000' }],
    viewer: () => {
        return {
            hello: 'not in schema',
        };
    },
};

const resolvers: Resolvers = {
    Query,
    Viewer: {
        virksomheter: async () => {
            return [{ uuid: 'virksomhet-uuid', navn: 'Virksomhet AS' }];
        },
    },
};

export default resolvers;

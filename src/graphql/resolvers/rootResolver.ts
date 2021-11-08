import { getMineSykmeldte } from '../../services/mineSykmeldteService';

import { PreviewSykmeldt, QueryResolvers, Resolvers } from './resolvers.generated';

const Query: QueryResolvers = {
    virksomheter: async () => {
        // TODO: Fetch from API
        return [{ navn: 'Virksomhet AS', orgnummer: 'virksomhet-uuid' }];
    },
    mineSykmeldte: (_, _args, context): Promise<PreviewSykmeldt[]> => {
        return getMineSykmeldte(context.accessToken);
    },
};

const resolvers: Resolvers = {
    Query,
};

export default resolvers;

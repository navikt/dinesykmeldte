import { QueryResolvers, Resolvers } from './resolvers.generated';

const Query: QueryResolvers = {
    virksomhet: (_parent, _args) => {
        return {
            orgnummer: _args.orgnummer,
            navn: 'Hard Kodesen',
        };
    },
    viewer: () => {
        return {};
    },
};

const resolvers: Resolvers = {
    Query,
    Viewer: {
        virksomheter: async () => {
            return [{ navn: 'Virksomhet AS', orgnummer: 'virksomhet-uuid' }];
        },
    },
};

export default resolvers;

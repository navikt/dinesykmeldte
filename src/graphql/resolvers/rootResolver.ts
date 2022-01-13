import * as mineSykmeldteService from '../../services/minesykmeldte/mineSykmeldteService';

import objectResolvers from './objectResolvers';
import {
    MutationResolvers,
    PreviewSykmeldt,
    QueryResolvers,
    Resolvers,
    Soknad,
    Sykmelding,
} from './resolvers.generated';

const Query: QueryResolvers = {
    virksomheter: async (_, _args, context) => {
        return mineSykmeldteService.getVirksomheter(context.accessToken);
    },
    mineSykmeldte: (_, _args, context): Promise<PreviewSykmeldt[]> => {
        return mineSykmeldteService.getMineSykmeldte(context.accessToken);
    },
    sykmelding: (_, args, context): Promise<Sykmelding | null> => {
        return mineSykmeldteService.getSykmelding(args.sykmeldingId, context.accessToken);
    },
    soknad: (_, args, context): Promise<Soknad | null> => {
        return mineSykmeldteService.getSoknad(args.soknadId, context.accessToken);
    },
};

const Mutation: MutationResolvers = {
    read: async (_, args, context) => {
        return mineSykmeldteService.markRead(args.type, args.id, context.accessToken);
    },
};

const resolvers: Partial<Resolvers> = {
    Query,
    Mutation,
    ...objectResolvers,
};

export default resolvers;

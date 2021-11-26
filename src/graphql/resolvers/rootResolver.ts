import * as mineSykmeldteService from '../../services/minesykmeldte/mineSykmeldteService';
import { Soknad } from '../queries/react-query.generated';

import { MutationResolvers, PreviewSykmeldt, QueryResolvers, Resolvers, Sykmelding } from './resolvers.generated';

const Query: QueryResolvers = {
    virksomheter: async () => {
        // TODO: Fetch from API
        return [{ navn: 'Virksomhet AS', orgnummer: 'virksomhet-uuid' }];
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

const resolvers: Resolvers = {
    Query,
    Mutation,
};

export default resolvers;

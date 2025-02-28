import * as mineSykmeldteService from '../../services/minesykmeldte/mineSykmeldteService'

import objectResolvers from './objectResolvers'
import {
    MutationResolvers,
    PreviewSykmeldt,
    QueryResolvers,
    Resolvers,
    Soknad,
    Sykmelding,
    Virksomhet,
} from './resolvers.generated'

const Query: QueryResolvers = {
    virksomheter: async (_, _args, context): Promise<Virksomhet[]> => {
        return mineSykmeldteService.getVirksomheter(context)
    },
    mineSykmeldte: (_, _args, context): Promise<PreviewSykmeldt[]> => {
        return mineSykmeldteService.getMineSykmeldte(context)
    },
    sykmelding: (_, args, context): Promise<Sykmelding> => {
        return mineSykmeldteService.getSykmelding(args.sykmeldingId, context)
    },
    soknad: (_, args, context): Promise<Soknad> => {
        return mineSykmeldteService.getSoknad(args.soknadId, context)
    },
}

const Mutation: MutationResolvers = {
    read: async (_, args, context) => {
        return mineSykmeldteService.markRead(args.type, args.id, context)
    },
    unlinkSykmeldt: async (_, args, context) => {
        return mineSykmeldteService.unlinkSykmeldt(args.sykmeldtId, context)
    },
    markAllSykmeldingerAndSoknaderAsRead: async (_, _args, context) => {
        return mineSykmeldteService.markAllSykmeldingerAndSoknaderAsRead(context)
    },
}

const resolvers: Partial<Resolvers> = {
    Query,
    Mutation,
    ...objectResolvers,
}

export default resolvers

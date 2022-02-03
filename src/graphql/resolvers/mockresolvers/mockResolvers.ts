import {
    MutationResolvers,
    PreviewSykmeldt,
    QueryResolvers,
    ReadType,
    Resolvers,
    Soknad,
    Sykmelding,
    Virksomhet,
} from '../resolvers.generated';
import objectResolvers from '../objectResolvers';

const Query: QueryResolvers = {
    virksomheter: async (): Promise<Virksomhet[]> => {
        const mockDb = await import('./mockDb').then((it) => it.default);
        return mockDb.virksomheter;
    },
    mineSykmeldte: async (): Promise<PreviewSykmeldt[]> => {
        const mockDb = await import('./mockDb').then((it) => it.default);
        return mockDb.sykmeldte;
    },
    sykmelding: async (_, args): Promise<Sykmelding | null> => {
        const mockDb = await import('./mockDb').then((it) => it.default);
        return mockDb.getSykmelding(args.sykmeldingId);
    },
    soknad: async (_, args): Promise<Soknad | null> => {
        const mockDb = await import('./mockDb').then((it) => it.default);
        return mockDb.getSoknad(args.soknadId);
    },
};

const Mutation: MutationResolvers = {
    read: async (_, { type, id }) => {
        switch (type) {
            case ReadType.Soknad: {
                const mockDb = await import('./mockDb').then((it) => it.default);
                mockDb.markSoknadRead(id);
                return true;
            }
            case ReadType.Sykmelding: {
                const mockDb = await import('./mockDb').then((it) => it.default);
                mockDb.markSykmeldingRead(id);
                return true;
            }
        }
    },
};

const resolvers: Partial<Resolvers> = {
    Query,
    Mutation,
    ...objectResolvers,
};

export default resolvers;

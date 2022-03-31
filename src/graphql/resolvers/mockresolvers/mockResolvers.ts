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

import mockDb from './mockDb';

const fakeLoadingTimeMs = 1500;

function fakeWait(): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, fakeLoadingTimeMs));
}

const Query: QueryResolvers = {
    virksomheter: async (): Promise<Virksomhet[]> => {
        await fakeWait();
        return mockDb().virksomheter;
    },
    mineSykmeldte: async (): Promise<PreviewSykmeldt[]> => {
        await fakeWait();
        return mockDb().sykmeldte;
    },
    sykmelding: async (_, args): Promise<Sykmelding | null> => {
        await fakeWait();
        return mockDb().getSykmelding(args.sykmeldingId);
    },
    soknad: async (_, args): Promise<Soknad | null> => {
        await fakeWait();
        return mockDb().getSoknad(args.soknadId);
    },
};

const Mutation: MutationResolvers = {
    read: async (_, { type, id }) => {
        switch (type) {
            case ReadType.Soknad: {
                await fakeWait();
                mockDb().markSoknadRead(id);
                return true;
            }
            case ReadType.Sykmelding: {
                await fakeWait();
                mockDb().markSykmeldingRead(id);
                return true;
            }
            case ReadType.Hendelse:
                await fakeWait();
                mockDb().markHendelseResolved(id);
                return true;
            case ReadType.Aktivitetsvarsel:
                await fakeWait();
                mockDb().markAktivitetvarselRead(id);
                return true;
        }
    },
    unlinkSykmeldt: async (_, { sykmeldtId }) => {
        await fakeWait();
        mockDb().unlinkSykmeldte(sykmeldtId);
        return true;
    },
};

const resolvers: Partial<Resolvers> = {
    Query,
    Mutation,
    ...objectResolvers,
};

export default resolvers;

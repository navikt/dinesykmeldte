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

const Query: QueryResolvers = {
    virksomheter: (): Virksomhet[] => {
        return mockDb.virksomheter;
    },
    mineSykmeldte: (): PreviewSykmeldt[] => {
        return mockDb.sykmeldte;
    },
    sykmelding: (_, args): Sykmelding | null => {
        return mockDb.getSykmelding(args.sykmeldingId);
    },
    soknad: (_, args): Soknad | null => {
        return mockDb.getSoknad(args.soknadId);
    },
};

const Mutation: MutationResolvers = {
    read: (_, { type, id }) => {
        switch (type) {
            case ReadType.Soknad: {
                mockDb.markSoknadRead(id);
                return true;
            }
            case ReadType.Sykmelding: {
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

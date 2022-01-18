import {
    MutationResolvers,
    PreviewSykmeldt,
    QueryResolvers,
    ReadType,
    Resolvers,
    Soknad,
    Sykmelding,
} from '../resolvers.generated';
import objectResolvers from '../objectResolvers';

import * as mockData from './mockData';
import { markSoknadRead, markSykmeldingRead } from './mockData';

const Query: QueryResolvers = {
    virksomheter: async () => {
        return [
            { navn: 'Virksomheta Ena', orgnummer: '896929119' },
            { navn: 'Hopla Stallen', orgnummer: 'orgnummer' },
        ];
    },
    mineSykmeldte: (): PreviewSykmeldt[] => {
        return mockData.previewSykmeldte;
    },
    sykmelding: (_, args): Sykmelding | null => {
        switch (args.sykmeldingId) {
            case '8317b5df-0a42-4b2b-a1de-fccbd9aca63a':
                return mockData.litenKoppSykmelding1;
            case '47440a09-e49c-49e1-b9da-17ce9a12a5a1':
                return mockData.litenKoppSykmelding2;
            case '7d7dbfce-35e8-42c4-b189-9701a685e613':
                return mockData.litenKoppSykmelding3;
            default:
                return null;
        }
    },
    soknad: (_, args): Soknad | null => {
        switch (args.soknadId) {
            case '01206017-dbcf-4f35-ac1f-8cbd2f76d012':
                return mockData.litenKoppSoknad1;
            default:
                return null;
        }
    },
};

const Mutation: MutationResolvers = {
    read: (_, { type, id }) => {
        switch (type) {
            case ReadType.Soknad: {
                if (id === mockData.litenKoppSoknad1.id) {
                    markSoknadRead(id);
                    mockData.litenKoppSoknad1.lest = true;
                    return true;
                }
                throw new Error(`Unable to find søknad with id ${id}`);
            }
            case ReadType.Sykmelding: {
                markSykmeldingRead(id);
                switch (id) {
                    case '8317b5df-0a42-4b2b-a1de-fccbd9aca63a':
                        mockData.litenKoppSykmelding1.lest = true;
                        return true;
                    case '47440a09-e49c-49e1-b9da-17ce9a12a5a1':
                        mockData.litenKoppSykmelding2.lest = true;
                        return true;
                    case '7d7dbfce-35e8-42c4-b189-9701a685e613':
                        mockData.litenKoppSykmelding3.lest = true;
                        return true;
                    default:
                        throw new Error(`Unable to find sykmelding with id ${id}`);
                }
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

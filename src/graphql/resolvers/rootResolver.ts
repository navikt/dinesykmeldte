import { QueryResolvers, Resolvers } from './resolvers.generated';
import { sykmeldingApen } from './mockresolvers/sykmelding-apen';

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
    Virksomhet: {
        sykmeldte: () => {
            return [
                {
                    uuid: 'fake-person-uuid',
                    navn: 'Fake fakesson',
                    sykmeldinger: [sykmeldingApen],
                    soknader: [],
                },
            ];
        },
    },
};

export default resolvers;

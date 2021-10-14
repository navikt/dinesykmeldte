import { logger } from '../../../utils/logger';
import { QueryResolvers, Resolvers } from '../resolvers.generated';

import { sykmeldingApen } from './sykmelding-apen';

logger.warn('-- Using mock resolvers');

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
        virksomheter: async (a, b, cont) => {
            return [
                { navn: 'Virksomheta Ena', orgnummer: 'LA8PV' },
                { navn: 'Hopla Stallen', orgnummer: 'C0M3-0N' },
            ];
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

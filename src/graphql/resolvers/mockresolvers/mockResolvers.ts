import { logger } from '../../../utils/logger';
import { QueryResolvers, Resolvers } from '../resolvers.generated';

// import { sykmeldingApen } from './sykmelding-apen';

logger.warn('-- Using mock resolvers');

const Query: QueryResolvers = {
    virksomheter: async () => {
        return [
            { navn: 'Virksomheta Ena', orgnummer: 'LA8PV' },
            { navn: 'Hopla Stallen', orgnummer: 'C0M3-0N' },
        ];
    },
    mineSykmeldte: () => {
        return [
            {
                navn: 'Suverin Suveren',
                orgnummer: '9292929292',
                fnr: '08088012345',
                startdatoSykefravaer: '2021-01-01',
                friskmeldt: false,
                narmestelederId: '1234-431',
                previewSykmeldinger: [],
                previewSoknader: [],
            },
        ];
    },
};

const resolvers: Resolvers = {
    Query,
};

export default resolvers;

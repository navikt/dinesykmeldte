import { logger } from '../../../utils/logger';
import { PreviewSykmeldt, QueryResolvers, Resolvers } from '../resolvers.generated';

logger.warn('-- Using mock resolvers');

const Query: QueryResolvers = {
    virksomheter: async () => {
        return [
            { navn: 'Virksomheta Ena', orgnummer: 'LA8PV' },
            { navn: 'Hopla Stallen', orgnummer: 'C0M3-0N' },
        ];
    },
    mineSykmeldte: (): PreviewSykmeldt[] => {
        return [
            {
                fnr: 'GUL-TOMAT',
                friskmeldt: false,
                narmestelederId: 'narmestelederId',
                navn: 'Gul Tomat',
                orgnummer: 'orgnummer',
                startdatoSykefravar: '2020-01-01',
                previewSykmeldinger: [
                    {
                        id: 'sykmelding-1',
                        fom: '2020-01-01',
                        tom: '2020-01-14',
                        type: 'TYPE-2',
                        lest: true,
                    },
                ],
                previewSoknader: [],
            },
            {
                fnr: 'SOT-KATT',
                friskmeldt: true,
                narmestelederId: 'narmestelederId',
                navn: 'Søt Katt',
                orgnummer: 'orgnummer',
                startdatoSykefravar: '2020-01-01',
                previewSykmeldinger: [
                    {
                        id: 'sykmelding-1',
                        fom: '2020-01-01',
                        tom: '2020-01-14',
                        type: 'TYPE-2',
                        lest: true,
                    },
                ],
                previewSoknader: [],
            },
            {
                fnr: 'LITEN-HUND',
                friskmeldt: true,
                narmestelederId: 'narmestelederId',
                navn: 'Liten Hund',
                orgnummer: 'orgnummer',
                startdatoSykefravar: '2020-01-01',
                previewSykmeldinger: [
                    {
                        id: 'sykmelding-1',
                        fom: '2020-01-01',
                        tom: '2020-01-14',
                        type: 'TYPE-2',
                        lest: false,
                    },
                ],
                previewSoknader: [
                    {
                        id: 'soknad-1',
                        fom: '2020-01-01',
                        tom: '2020-01-14',
                        lest: false,
                        status: 'TODO',
                        sykmeldingId: 'sykmelding-1',
                        sendtDato: '2021-05-05',
                    },
                ],
            },
            {
                fnr: 'SUPERNOVA',
                friskmeldt: false,
                narmestelederId: 'narmestelederId',
                navn: 'Super Nova',
                orgnummer: 'orgnummer',
                startdatoSykefravar: '2020-01-01',
                previewSykmeldinger: [
                    {
                        id: 'sykmelding-1',
                        fom: '2020-01-01',
                        tom: '2020-01-14',
                        type: 'TYPE-2',
                        lest: false,
                    },
                    {
                        id: 'sykmelding-2',
                        fom: '2020-01-01',
                        tom: '2020-01-14',
                        type: 'TYPE-2',
                        lest: false,
                    },
                ],
                previewSoknader: [],
            },
        ];
    },
};

const resolvers: Resolvers = {
    Query,
};

export default resolvers;

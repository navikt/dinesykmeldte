import {
    ArbeidsrelatertArsakEnum,
    PreviewSykmeldt,
    Soknad,
    SoknadsstatusEnum,
    SoknadstypeEnum,
    Sykmelding,
} from '../resolvers.generated';

export const litenKoppSykmelding1: Sykmelding = {
    id: '8317b5df-0a42-4b2b-a1de-fccbd9aca63a',
    startdatoSykefravar: '2021-11-02',
    kontaktDato: null,
    navn: 'Liten Kopp',
    fnr: '03097722411',
    lest: false,
    arbeidsgiver: { orgnummer: '896929119', navn: 'SAUEFABRIKK', yrke: null },
    perioder: [
        {
            fom: '2021-11-02',
            tom: '2021-11-08',
            arbeidsrelatertArsak: {
                arsak: [ArbeidsrelatertArsakEnum.Annet],
                beskrivelse: 'andre årsaker til sykefravær',
            },
        },
    ],
    arbeidsforEtterPeriode: true,
    hensynArbeidsplassen: 'Må ta det pent',
    tiltakArbeidsplassen: 'Fortsett som sist.',
    innspillArbeidsplassen: null,
    behandler: { navn: 'Frida Perma Frost', hprNummer: null, telefon: 'tel:94431152' },
};

export const litenKoppSykmelding2: Sykmelding = {
    id: '47440a09-e49c-49e1-b9da-17ce9a12a5a1',
    startdatoSykefravar: '2021-11-02',
    kontaktDato: null,
    navn: 'Liten Kopp',
    fnr: '03097722411',
    lest: false,
    arbeidsgiver: { orgnummer: '896929119', navn: 'SAUEFABRIKK', yrke: null },
    perioder: [
        {
            fom: '2021-11-02',
            tom: '2021-11-08',
            arbeidsrelatertArsak: {
                arsak: [ArbeidsrelatertArsakEnum.Annet],
                beskrivelse: 'andre årsaker til sykefravær',
            },
        },
    ],
    arbeidsforEtterPeriode: true,
    hensynArbeidsplassen: 'Må ta det pent',
    tiltakArbeidsplassen: 'Fortsett som sist.',
    innspillArbeidsplassen: null,
    behandler: { navn: 'Frida Perma Frost', hprNummer: null, telefon: 'tel:94431152' },
};

export const litenKoppSoknad1: Soknad = {
    id: '01206017-dbcf-4f35-ac1f-8cbd2f76d012',
    sykmeldingId: '47440a09-e49c-49e1-b9da-17ce9a12a5a1',
    navn: 'Liten Kopp',
    fnr: '03097722411',
    lest: false,
    orgnummer: '896929119',
    sendtDato: '2021-11-22',
    tom: '2021-11-08',
    details: { type: SoknadstypeEnum.Arbeidstakere, status: SoknadsstatusEnum.Sendt },
};

export const litenKoppSykmelding3: Sykmelding = {
    id: '7d7dbfce-35e8-42c4-b189-9701a685e613',
    startdatoSykefravar: '2021-11-02',
    kontaktDato: null,
    navn: 'Liten Kopp',
    fnr: '03097722411',
    lest: false,
    arbeidsgiver: { orgnummer: '896929119', navn: 'SAUEFABRIKK', yrke: null },
    perioder: [
        {
            fom: '2021-11-15',
            tom: '2021-11-21',
            arbeidsrelatertArsak: {
                arsak: [ArbeidsrelatertArsakEnum.Annet],
                beskrivelse: 'andre årsaker til sykefravær',
            },
        },
    ],
    arbeidsforEtterPeriode: true,
    hensynArbeidsplassen: 'Må ta det pent',
    tiltakArbeidsplassen: 'Fortsett som sist.',
    innspillArbeidsplassen: null,
    behandler: { navn: 'Frida Perma Frost', hprNummer: null, telefon: 'tel:94431152' },
};

export const previewSykmeldte: PreviewSykmeldt[] = [
    {
        fnr: '03097722411',
        navn: 'Liten Kopp',
        orgnummer: '896929119',
        friskmeldt: false,
        narmestelederId: 'c6d0b1b9-463d-4967-ab3e-d0f84a72b88f',
        startdatoSykefravar: '2021-11-02',
        previewSykmeldinger: [
            {
                id: '8317b5df-0a42-4b2b-a1de-fccbd9aca63a',
                fom: '2021-11-02',
                tom: '2021-11-08',
                lest: false,
                type: '100%',
            },
            {
                id: '47440a09-e49c-49e1-b9da-17ce9a12a5a1',
                fom: '2021-11-02',
                tom: '2021-11-08',
                lest: false,
                type: '100%',
            },
            {
                id: '7d7dbfce-35e8-42c4-b189-9701a685e613',
                fom: '2021-11-15',
                tom: '2021-11-21',
                lest: false,
                type: '100%',
            },
        ],
        previewSoknader: [
            {
                id: '01206017-dbcf-4f35-ac1f-8cbd2f76d012',
                fom: '2021-11-02',
                tom: '2021-11-08',
                lest: false,
                status: SoknadsstatusEnum.Sendt,
                sendtDato: '2021-11-22',
                sykmeldingId: '47440a09-e49c-49e1-b9da-17ce9a12a5a1',
            },
        ],
    },
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
                status: SoknadsstatusEnum.Sendt,
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

export function markSykmeldingRead(id: string): void {
    previewSykmeldte.find((sykmeldt) =>
        sykmeldt.previewSykmeldinger.find((sykmelding) => {
            if (sykmelding.id === id) {
                sykmelding.lest = true;
                return true;
            }
            return false;
        }),
    );
}

export function markSoknadRead(id: string): void {
    previewSykmeldte.find((sykmeldt) =>
        sykmeldt.previewSoknader.find((soknad) => {
            if (soknad.id === id) {
                soknad.lest = true;
                return true;
            }
            return false;
        }),
    );
}
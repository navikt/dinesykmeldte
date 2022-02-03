import {
    ArbeidsrelatertArsakEnum,
    Periode,
    PeriodeEnum,
    PreviewSendtSoknad,
    PreviewSoknad,
    PreviewSykmelding,
    PreviewSykmeldt,
    QuerySoknadArgs,
    QuerySykmeldingArgs,
    Soknad,
    SoknadsstatusEnum,
    SoknadstypeEnum,
    Sykmelding,
    Virksomhet,
} from '../../resolvers.generated';

import {
    createPreviewSykmeldingFromSykmelding,
    entries,
    getEarliestFom,
    getEarliestFomInSykmeldings,
} from './mockUtils';

const MOCK_ORG_1 = '896929119';
const MOCK_ORG_2 = 'orgnummer';

const VirksomhetLiten: Virksomhet = {
    navn: 'Liten Bedrift AS',
    orgnummer: MOCK_ORG_1,
};

const VirksomhetStor: Virksomhet = {
    navn: 'Stor & Syk AS',
    orgnummer: MOCK_ORG_2,
};

type Sykmeldte = 'Liten Kopp' | 'Gul Tomat' | 'Søt Katt' | 'Liten Hund' | 'Super Nova' | 'Stor Kake';

type SykmeldtDeduplicated = Omit<
    PreviewSykmeldt,
    'navn' | 'previewSykmeldinger' | 'previewSoknader' | 'startdatoSykefravar'
>;

type SykmeldingDeduplicated = Omit<Sykmelding, 'navn' | 'fnr' | 'arbeidsgiver' | 'startdatoSykefravar' | 'perioder'> & {
    perioder: [Periode, ...Periode[]];
};

export class FakeMockDB {
    private readonly _behandlere = [{ navn: 'Frida Perma Frost', hprNummer: null, telefon: 'tel:94431152' }];
    private readonly _sykmeldte: Record<Sykmeldte, SykmeldtDeduplicated> = {
        'Liten Kopp': {
            fnr: '03097722411',
            orgnummer: MOCK_ORG_1,
            // TODO gjøre friskmeldt også deduserbar?
            friskmeldt: false,
            narmestelederId: 'c6d0b1b9-463d-4967-ab3e-d0f84a72b88f',
        },
        'Gul Tomat': {
            fnr: 'GUL-TOMAT',
            friskmeldt: false,
            narmestelederId: '62f86147-fe79-4936-a9bc-3eb94a31cc48',
            orgnummer: MOCK_ORG_2,
        },
        'Søt Katt': {
            fnr: 'SOT-KATT',
            friskmeldt: true,
            narmestelederId: '17620181-5b12-4843-9e0e-4d80dcd8fccf',
            orgnummer: MOCK_ORG_2,
        },
        'Liten Hund': {
            fnr: 'LITEN-HUND',
            friskmeldt: true,
            narmestelederId: '30a821bf-5dc8-48b4-a2b7-48a8a61e0ebc',
            orgnummer: MOCK_ORG_2,
        },
        'Super Nova': {
            fnr: 'SUPERNOVA',
            friskmeldt: false,
            narmestelederId: 'fc5e1e83-8ff0-4493-8367-71fa6b347927',
            orgnummer: MOCK_ORG_2,
        },
        'Stor Kake': {
            fnr: 'STOR-KAKE',
            friskmeldt: false,
            narmestelederId: '4c6edd84-b63d-456c-8402-23f69af1dcf9',
            orgnummer: MOCK_ORG_2,
        },
    };
    private readonly _sykmeldinger: Record<Sykmeldte, [SykmeldingDeduplicated, ...SykmeldingDeduplicated[]]> = {
        'Liten Kopp': [
            {
                id: '8317b5df-0a42-4b2b-a1de-fccbd9aca63a',
                kontaktDato: null,
                lest: false,
                arbeidsforEtterPeriode: true,
                hensynArbeidsplassen: 'Må ta det pent',
                tiltakArbeidsplassen: 'Fortsett som sist.',
                innspillArbeidsplassen: null,
                behandler: this._behandlere[0],
                perioder: [
                    {
                        type: PeriodeEnum.AktivitetIkkeMulig,
                        fom: '2021-11-02',
                        tom: '2021-11-03',
                        arbeidsrelatertArsak: {
                            arsak: [ArbeidsrelatertArsakEnum.Annet],
                            beskrivelse: 'Må jobbe hjemmefra',
                        },
                    },
                    {
                        type: PeriodeEnum.Gradert,
                        fom: '2021-11-04',
                        tom: '2021-11-05',
                        grad: 50,
                        reisetilskudd: false,
                    },
                    {
                        type: PeriodeEnum.Avventende,
                        fom: '2021-11-06',
                        tom: '2021-11-07',
                        tilrettelegging: 'Må ha ekstra lange pauser',
                    },
                    {
                        type: PeriodeEnum.Behandlingsdager,
                        fom: '2021-11-08',
                        tom: '2021-11-09',
                        behandlingsdager: 1,
                    },
                    {
                        type: PeriodeEnum.Reisetilskudd,
                        fom: '2021-11-10',
                        tom: '2021-11-11',
                    },
                ],
            },
            {
                id: '47440a09-e49c-49e1-b9da-17ce9a12a5a1',
                kontaktDato: null,
                lest: false,
                arbeidsforEtterPeriode: true,
                hensynArbeidsplassen: 'Må ta det pent',
                tiltakArbeidsplassen: 'Fortsett som sist.',
                innspillArbeidsplassen: null,
                behandler: this._behandlere[0],
                perioder: [
                    {
                        type: PeriodeEnum.AktivitetIkkeMulig,
                        fom: '2021-11-02',
                        tom: '2021-11-08',
                        arbeidsrelatertArsak: {
                            arsak: [ArbeidsrelatertArsakEnum.Annet],
                            beskrivelse: 'andre årsaker til sykefravær',
                        },
                    },
                ],
            },
            {
                id: '7d7dbfce-35e8-42c4-b189-9701a685e613',
                kontaktDato: null,
                lest: false,
                arbeidsforEtterPeriode: true,
                hensynArbeidsplassen: 'Må ta det pent',
                tiltakArbeidsplassen: 'Fortsett som sist.',
                innspillArbeidsplassen: null,
                behandler: this._behandlere[0],
                perioder: [
                    {
                        type: PeriodeEnum.AktivitetIkkeMulig,
                        fom: '2021-11-15',
                        tom: '2021-11-21',
                        arbeidsrelatertArsak: {
                            arsak: [ArbeidsrelatertArsakEnum.Annet],
                            beskrivelse: 'andre årsaker til sykefravær',
                        },
                    },
                ],
            },
        ],
        'Gul Tomat': [
            {
                id: '5b64a54c-78f5-49a0-a89c-a4b878f3d7fa',
                kontaktDato: null,
                lest: false,
                perioder: [
                    {
                        type: PeriodeEnum.AktivitetIkkeMulig,
                        fom: '2021-11-02',
                        tom: '2021-11-03',
                        arbeidsrelatertArsak: {
                            arsak: [ArbeidsrelatertArsakEnum.ManglendeTilrettelegging],
                            beskrivelse: 'Trenger mer ståpulter',
                        },
                    },
                ],
                arbeidsforEtterPeriode: true,
                hensynArbeidsplassen: 'Må ta det pent',
                tiltakArbeidsplassen: 'Fortsett som sist.',
                innspillArbeidsplassen: null,
                behandler: this._behandlere[0],
            },
        ],
        'Søt Katt': [
            {
                id: '39687e2b-2939-4e4a-9241-1b57e81eebee',
                kontaktDato: null,
                lest: false,
                arbeidsforEtterPeriode: true,
                hensynArbeidsplassen: 'Må ta det pent',
                tiltakArbeidsplassen: 'Fortsett som sist.',
                innspillArbeidsplassen: null,
                behandler: this._behandlere[0],
                perioder: [
                    {
                        type: PeriodeEnum.AktivitetIkkeMulig,
                        fom: '2021-11-02',
                        tom: '2021-11-08',
                        arbeidsrelatertArsak: {
                            arsak: [ArbeidsrelatertArsakEnum.Annet],
                            beskrivelse: 'andre årsaker til sykefravær',
                        },
                    },
                ],
            },
        ],
        'Liten Hund': [
            {
                id: '58cbd8c3-0921-40d0-b7d3-b8c07eaef9a1',
                kontaktDato: null,
                lest: false,
                arbeidsforEtterPeriode: true,
                hensynArbeidsplassen: 'Må ta det pent',
                tiltakArbeidsplassen: 'Fortsett som sist.',
                innspillArbeidsplassen: null,
                behandler: this._behandlere[0],
                perioder: [
                    {
                        type: PeriodeEnum.AktivitetIkkeMulig,
                        fom: '2021-11-02',
                        tom: '2021-11-08',
                        arbeidsrelatertArsak: {
                            arsak: [ArbeidsrelatertArsakEnum.ManglendeTilrettelegging],
                            beskrivelse: 'Trenger sittestol og kaffe hver halvtime',
                        },
                    },
                ],
            },
        ],
        'Super Nova': [
            {
                id: '9c237c5b-1011-44bf-a93a-7305e60d1bdf',
                kontaktDato: null,
                lest: false,
                arbeidsforEtterPeriode: true,
                hensynArbeidsplassen: 'Må ta det pent',
                tiltakArbeidsplassen: 'Fortsett som sist.',
                innspillArbeidsplassen: null,
                behandler: this._behandlere[0],
                perioder: [
                    {
                        type: PeriodeEnum.AktivitetIkkeMulig,
                        fom: '2021-11-02',
                        tom: '2021-11-08',
                        arbeidsrelatertArsak: {
                            arsak: [ArbeidsrelatertArsakEnum.Annet],
                            beskrivelse: 'Trenger førerkatt',
                        },
                    },
                ],
            },
        ],
        'Stor Kake': [
            {
                id: '67c87788-4fb0-4d94-8693-605f19bb29dc',
                kontaktDato: null,
                lest: false,
                arbeidsforEtterPeriode: true,
                hensynArbeidsplassen: 'Må ta det pent',
                tiltakArbeidsplassen: 'Fortsett som sist.',
                innspillArbeidsplassen: null,
                behandler: this._behandlere[0],
                perioder: [
                    {
                        type: PeriodeEnum.AktivitetIkkeMulig,
                        fom: '2021-11-02',
                        tom: '2021-11-08',
                        arbeidsrelatertArsak: {
                            arsak: [ArbeidsrelatertArsakEnum.Annet],
                            beskrivelse:
                                'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
                        },
                    },
                ],
            },
        ],
    };
    private readonly _soknader: Record<Sykmeldte, PreviewSoknad[]> = {
        'Gul Tomat': [],
        'Liten Kopp': [
            {
                __typename: 'PreviewSendtSoknad',
                status: SoknadsstatusEnum.Sendt,
                id: '01206017-dbcf-4f35-ac1f-8cbd2f76d012',
                sykmeldingId: this._sykmeldinger['Liten Kopp'][0].id,
                lest: false,
                sendtDato: '2021-11-22',
                fom: '2021-11-08',
                tom: '2021-11-08',
                korrigertBySoknadId: null,
            },
        ],
        'Søt Katt': [],
        'Liten Hund': [],
        'Super Nova': [],
        'Stor Kake': [],
    };

    public get virksomheter(): Virksomhet[] {
        return [VirksomhetLiten, VirksomhetStor];
    }

    public get sykmeldte(): PreviewSykmeldt[] {
        return entries(this._sykmeldte).map(([sykmeldtNavn, sykmeldt]): PreviewSykmeldt => {
            const sykmeldtSykmeldinger: Sykmelding[] = Object.entries(this._sykmeldinger)
                .filter(([sykmeldingNavn]) => sykmeldtNavn === sykmeldingNavn)
                .flatMap(([navn, sykmeldinger]) =>
                    sykmeldinger.map((it): [string, SykmeldingDeduplicated] => [navn, it]),
                )
                .map(([navn, sykmelding]): Sykmelding => toCompleteSykmelding(navn, sykmeldt, sykmelding));

            const sykmeldinger: PreviewSykmelding[] = sykmeldtSykmeldinger.map(createPreviewSykmeldingFromSykmelding);
            if (sykmeldinger.length === 0) {
                throw new Error(
                    `Invalid test data, every sykmeldt needs at least one sykmelding, "${sykmeldtNavn}" has none`,
                );
            }

            return {
                ...sykmeldt,
                navn: sykmeldtNavn,
                startdatoSykefravar: getEarliestFomInSykmeldings(sykmeldtSykmeldinger),
                previewSykmeldinger: sykmeldinger,
                previewSoknader: this._soknader[sykmeldtNavn],
            };
        });
    }

    public getSykmelding(sykmeldingId: QuerySykmeldingArgs['sykmeldingId']): Sykmelding {
        const [navn, sykmelding] = this.getSykmeldingById(sykmeldingId);
        const sykmeldt: SykmeldtDeduplicated = this._sykmeldte[navn];

        return toCompleteSykmelding(navn, sykmeldt, sykmelding);
    }

    public getSoknad(soknadId: QuerySoknadArgs['soknadId']): Soknad {
        const [navn, soknad] = this.getSoknadById(soknadId);
        const sykmeldt: SykmeldtDeduplicated = this._sykmeldte[navn];

        if (soknad.__typename !== 'PreviewSendtSoknad') {
            throw new Error('500: Søknad is not sendt and should not be fetched using getSoknad');
        }

        return toCompleteSoknad(navn, sykmeldt, soknad);
    }

    public markSoknadRead(soknadId: string): void {
        const [, soknad] = this.getSoknadById(soknadId);

        switch (soknad.__typename) {
            case 'PreviewFremtidigSoknad':
                // TODO
                break;
            case 'PreviewKorrigertSoknad':
                // TODO
                break;
            case 'PreviewNySoknad':
                soknad.varsel = false;
                break;
            case 'PreviewSendtSoknad':
                soknad.lest = true;
                break;
            default:
                throw new Error('Unable to deduce soknad type');
        }
    }

    public markSykmeldingRead(sykmeldingId: string): void {
        const [, sykmelding] = this.getSykmeldingById(sykmeldingId);

        sykmelding.lest = true;
    }

    private getSykmeldingById(sykmeldingId: string): [Sykmeldte, SykmeldingDeduplicated] {
        const sykmeldingTuple: [Sykmeldte, SykmeldingDeduplicated] | undefined = entries(this._sykmeldinger)
            .flatMap(([navn, sykmeldinger]) =>
                sykmeldinger.map((it): [Sykmeldte, SykmeldingDeduplicated] => [navn, it]),
            )
            .find(([, sykmelding]) => sykmelding.id === sykmeldingId);

        if (!sykmeldingTuple) {
            throw new Error(`404: Unable to find sykmelding with ID ${sykmeldingId} in mock test data`);
        }

        return sykmeldingTuple;
    }

    private getSoknadById(soknadId: string): [Sykmeldte, PreviewSoknad] {
        const soknadTuple: [Sykmeldte, PreviewSoknad] | undefined = entries(this._soknader)
            .flatMap(([navn, soknader]) => soknader.map((it): [Sykmeldte, PreviewSoknad] => [navn, it]))
            .find(([, soknad]) => soknad.id === soknadId);

        if (!soknadTuple) {
            throw new Error(`404: Unable to find soknad with ID ${soknadId} in mock test data`);
        }

        return soknadTuple;
    }
}

function toCompleteSykmelding(
    navn: string,
    sykmeldt: SykmeldtDeduplicated,
    sykmelding: SykmeldingDeduplicated,
): Sykmelding {
    return {
        ...sykmelding,
        navn,
        fnr: sykmeldt.fnr,
        arbeidsgiver: {
            navn: VirksomhetLiten.navn,
            orgnummer: VirksomhetLiten.orgnummer,
            yrke: 'Ostehøvler',
        },
        startdatoSykefravar: getEarliestFom(sykmelding.perioder),
    };
}

function toCompleteSoknad(navn: string, sykmeldt: SykmeldtDeduplicated, soknad: PreviewSendtSoknad): Soknad {
    return {
        ...soknad,
        __typename: 'Soknad',
        navn,
        fnr: sykmeldt.fnr,
        orgnummer: sykmeldt.orgnummer,
        tom: soknad.tom,
        details: {
            type: SoknadstypeEnum.AnnetArbeidsforhold,
            status: SoknadsstatusEnum.Ny,
        },
    };
}

import {
    AnnenFraverGrunn,
    ArbeidsrelatertArsakType,
    HarArbeidsgiver,
    MedisinskArsakType,
    Sykmelding,
} from '../resolvers.generated';

export const sykmeldingApen: Sykmelding = {
    id: 'APEN',
    arbeidsgiver: {
        navn: 'Navn Navnesen',
        stillingsprosent: 100,
        harArbeidsgiver: HarArbeidsgiver.EnArbeidsgiver,
        yrkesbetegnelse: 'TODO',
    },
    perioder: [
        {
            fom: '2020-02-10',
            tom: '2020-02-15',
            behandlingsdager: 2,
            reisetilskudd: false,
        },
        {
            fom: '2020-02-10',
            tom: '2020-02-15',
            aktivitetIkkeMulig: {
                medisinskArsak: {
                    arsak: [MedisinskArsakType.AktivitetForverrerTilstand, MedisinskArsakType.Annet],
                    beskrivelse: 'Dette er en beskrivelse av den medisinske årsaken.',
                },
                arbeidsrelatertArsak: {
                    arsak: [ArbeidsrelatertArsakType.Annet],
                    beskrivelse: 'Dette er en beskrivelse av den arbeidsrelaterte årsaken',
                },
            },
            reisetilskudd: false,
        },
        {
            fom: '2020-02-16',
            tom: '2020-02-20',
            gradert: {
                grad: 20,
                reisetilskudd: false,
            },
            reisetilskudd: false,
        },
    ],
    medisinskVurdering: {
        hovedDiagnose: {
            system: '2.16.578.1.12.4.1.1.7170',
            kode: 'K24',
            tekst: 'Rar sykdom',
        },
        biDiagnoser: [
            {
                system: '2.16.578.1.12.4.1.1.7170',
                kode: '-57',
                tekst: 'Rar sykdom',
            },
            {
                system: '2.16.578.1.12.4.1.1.7170',
                kode: '-59',
                tekst: 'Sykdom0',
            },
        ],
        svangerskap: true,
        yrkesskade: true,
        yrkesskadeDato: '2018-10-18',
        annenFraversArsak: {
            beskrivelse:
                'word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word',
            grunn: [AnnenFraverGrunn.NodvendigKontrollundenrsokelse],
        },
    },
    prognose: {
        arbeidsforEtterPeriode: true,
        hensynArbeidsplassen: 'Du må ta det rolig på jobben',
    },
    skjermesForPasient: false,
    utdypendeOpplysninger: [
        {
            navn: '6.1',
            opplysninger: [
                {
                    navn: '6.1.1',
                    svar: { sporsmal: 'Dette er et spørsmål', svar: 'Dette er et svar', restriksjoner: [] },
                },
            ],
        },
        {
            navn: '6.2',
            opplysninger: [
                {
                    navn: '6.2.1',
                    svar: { sporsmal: 'Dette er et spørsmål', svar: 'Dette er et svar', restriksjoner: [] },
                },
            ],
        },
        {
            navn: '6.3',
            opplysninger: [
                {
                    navn: '6.3.1',
                    svar: { sporsmal: 'Dette er et spørsmål', svar: 'Dette er et svar', restriksjoner: [] },
                },
            ],
        },
    ],
    tiltakArbeidsplassen: 'Tiltak på arbeidsplassen',
    tiltakNAV: 'Tiltak NAV',
    andreTiltak: 'Du må gjøre andre tiltak',
    meldingTilNAV: { bistandUmiddelbart: true, beskrivBistand: 'Trenger hjelp med penger' },
    kontaktMedPasient: {
        kontaktDato: '2020-04-01',
        begrunnelseIkkeKontakt: 'Han var kjempesyk',
    },
    behandletTidspunkt: '2020-01-01',
    behandler: {
        fornavn: 'Fornavn',
        mellomnavn: null,
        etternavn: 'Etternavn',
        adresse: {
            gate: 'Gateveien 4',
            postnummer: 1001,
            kommune: 'Oslo',
            postboks: '1212 Gateveien',
            land: 'NO',
        },
        tlf: '900 00 000',
        aktoerId: 'aktør-id',
        fnr: 'behandler-fnr',
        her: 'behandlers-her',
        hpr: 'behandlers-hpr',
    },
    syketilfelleStartDato: '2018-10-10',
    navnFastlege: 'Doktor Legesen',
    avsenderSystem: {
        navn: 'Systemiosis',
        versjon: '1.0.1',
    },
    meldingTilArbeidsgiver: null,
    msgId: 'uuid-eller-noe',
    pasientAktoerId: 'pasient-aktør-id',
    signaturDato: 'Dato her kanskje',
};

import { MockedResponse } from '@apollo/client/testing';
import { Cache, TypedDocumentNode } from '@apollo/client';
import { FetchResult } from '@apollo/client/link/core';
import { ResultFunction } from '@apollo/client/testing/core/mocking/mockLink';

import {
    ArbeidsrelatertArsakEnum,
    PreviewSoknad_PreviewFremtidigSoknad_Fragment,
    PreviewSoknad_PreviewKorrigertSoknad_Fragment,
    PreviewSoknad_PreviewNySoknad_Fragment,
    PreviewSoknad_PreviewSendtSoknad_Fragment,
    PreviewSykmeldingFragment,
    PreviewSykmeldtFragment,
    SykmeldingFragment,
    SykmeldingPeriode_AktivitetIkkeMulig_Fragment,
    SykmeldingPeriode_Gradert_Fragment,
    VirksomheterQuery,
    SoknadFragment,
    DialogmoteFragment,
    SoknadSporsmalSvartypeEnum,
    SoknadSporsmalKriterierEnum,
    PeriodeEnum,
} from '../../graphql/queries/graphql.generated';

export function createPreviewSendtSoknad(
    overrides?: Partial<PreviewSoknad_PreviewSendtSoknad_Fragment>,
): PreviewSoknad_PreviewSendtSoknad_Fragment {
    return {
        __typename: 'PreviewSendtSoknad',
        id: 'default-soknad-1',
        fom: '2021-10-01',
        tom: '2021-10-20',
        lest: false,
        sendtDato: '2021-10-05',
        sykmeldingId: 'default-sykmelding-1',
        perioder: [],
        ...overrides,
    };
}

export function createPreviewFremtidigSoknad(
    overrides?: Partial<PreviewSoknad_PreviewFremtidigSoknad_Fragment>,
): PreviewSoknad_PreviewFremtidigSoknad_Fragment {
    return {
        __typename: 'PreviewFremtidigSoknad',
        id: 'default-soknad-1',
        fom: '2021-10-01',
        tom: '2021-10-20',
        sykmeldingId: 'default-sykmelding-1',
        perioder: [],
        ...overrides,
    };
}

export function createPreviewNySoknad(
    overrides?: Partial<PreviewSoknad_PreviewNySoknad_Fragment>,
): PreviewSoknad_PreviewNySoknad_Fragment {
    return {
        __typename: 'PreviewNySoknad',
        id: 'default-soknad-1',
        fom: '2021-10-01',
        tom: '2021-10-20',
        sykmeldingId: 'default-sykmelding-1',
        varsel: true,
        ikkeSendtSoknadVarsel: false,
        perioder: [],
        ...overrides,
    };
}

export function createPreviewKorrigertSoknad(
    overrides?: Partial<PreviewSoknad_PreviewKorrigertSoknad_Fragment>,
): PreviewSoknad_PreviewKorrigertSoknad_Fragment {
    return {
        __typename: 'PreviewKorrigertSoknad',
        id: 'default-soknad-1',
        fom: '2021-10-01',
        tom: '2021-10-20',
        sykmeldingId: 'default-sykmelding-1',
        korrigererSoknadId: 'korrigert-by-1',
        korrigertBySoknadId: 'korrigerer-1',
        lest: false,
        perioder: [],
        ...overrides,
    };
}

export function createPreviewSykmelding(overrides?: Partial<PreviewSykmeldingFragment>): PreviewSykmeldingFragment {
    return {
        __typename: 'PreviewSykmelding',
        id: 'default-sykmelding-1',
        fom: '2021-10-01',
        tom: '2021-10-20',
        type: '100%',
        lest: false,
        ...overrides,
    };
}

export function createDialogmote(overrides?: Partial<DialogmoteFragment>): DialogmoteFragment {
    return {
        __typename: 'Dialogmote',
        hendelseId: '41e890b3-a9e4-4246-8ad2-aac208ef9a93',
        tekst: 'Fake hendelse tekst, hello',
        ...overrides,
    };
}

export function createSoknad(overrides?: Partial<SoknadFragment>): SoknadFragment {
    return {
        __typename: 'Soknad',
        id: 'soknad-id',
        sykmeldingId: 'default-sykmelding-1',
        fnr: '03097722411',
        navn: 'Test person',
        fom: '2021-03-01',
        tom: '2021-06-23',
        lest: false,
        korrigertBySoknadId: '525642-4425fg-55226-7gereg-432424fjz',
        perioder: [
            {
                fom: '2021-11-08',
                tom: '2021-11-10',
                sykmeldingstype: PeriodeEnum.Gradert,
                sykmeldingsgrad: 50,
            },
        ],
        sporsmal: [
            {
                id: '895023532',
                tag: 'Ferie',
                min: null,
                max: null,
                sporsmalstekst: 'Har du vært på ferie i denne perioden?',
                undertekst: null,
                svartype: SoknadSporsmalSvartypeEnum.Checkbox,
                kriterieForVisningAvUndersporsmal: SoknadSporsmalKriterierEnum.Checked,
                svar: [
                    {
                        verdi: 'Nei',
                    },
                ],
                undersporsmal: [
                    {
                        id: '895023532',
                        tag: 'Permisjon',
                        min: null,
                        max: null,
                        sporsmalstekst: 'Har du hatt permisjon i denne perioden?',
                        undertekst: null,
                        svartype: SoknadSporsmalSvartypeEnum.Checkbox,
                        kriterieForVisningAvUndersporsmal: SoknadSporsmalKriterierEnum.Checked,
                        svar: [
                            {
                                verdi: 'Ja',
                            },
                        ],
                        undersporsmal: [],
                    },
                ],
            },
        ],
        ...overrides,
    };
}

export function createSykmelding(overrides?: Partial<SykmeldingFragment>): SykmeldingFragment {
    return {
        __typename: 'Sykmelding',
        id: 'default-sykmelding-1',
        fnr: '08088033221',
        lest: false,
        navn: 'Test Testysson',
        startdatoSykefravar: '2020-05-05',
        arbeidsforEtterPeriode: false,
        tiltakArbeidsplassen: 'Flere pauser',
        arbeidsgiver: {
            navn: 'Eplemostfabrikken AS',
            yrke: 'Eplemoser',
        },
        behandler: {
            navn: 'B. Handlersson',
            telefon: '81549300',
        },
        perioder: [createAktivitetIkkeMuligPeriode()],
        ...overrides,
    };
}

export function createAktivitetIkkeMuligPeriode(
    overrides?: Partial<Pick<SykmeldingPeriode_AktivitetIkkeMulig_Fragment, 'fom' | 'tom' | 'arbeidsrelatertArsak'>>,
): SykmeldingPeriode_AktivitetIkkeMulig_Fragment {
    return {
        __typename: 'AktivitetIkkeMulig',
        fom: '2021-08-08',
        tom: '2021-08-15',
        arbeidsrelatertArsak: {
            arsak: [ArbeidsrelatertArsakEnum.ManglendeTilrettelegging],
            beskrivelse: 'Veldig årsak',
        },
        ...overrides,
    };
}

export function createGradertPeriode(
    overrides?: Partial<SykmeldingPeriode_Gradert_Fragment>,
): SykmeldingPeriode_Gradert_Fragment {
    return {
        __typename: 'Gradert',
        fom: '2021-08-16',
        tom: '2021-08-20',
        grad: 67,
        reisetilskudd: false,
        ...overrides,
    };
}

export function createPreviewSykmeldt(overrides?: Partial<PreviewSykmeldtFragment>): PreviewSykmeldtFragment {
    return {
        __typename: 'PreviewSykmeldt',
        navn: 'Ola Normann',
        fnr: '08088012345',
        orgnummer: '123456789',
        friskmeldt: false,
        narmestelederId: `narmesteleder-1-${overrides?.fnr ?? '08088012345'}`,
        startdatoSykefravar: '2021-06-07',
        previewSykmeldinger: [createPreviewSykmelding()],
        previewSoknader: [],
        dialogmoter: [],
        ...overrides,
    };
}

export function createVirksomhet(
    overrides?: Partial<VirksomheterQuery['virksomheter'][0]>,
): VirksomheterQuery['virksomheter'][0] {
    return {
        __typename: 'Virksomhet',
        navn: 'Virksomhet 1',
        orgnummer: '123456789',
        ...overrides,
    };
}

export function createInitialQuery<Query, Variables>(
    typedDocumentNode: TypedDocumentNode<Query, Variables>,
    data: Query,
    variables?: Variables,
): Cache.WriteQueryOptions<Query, Variables> {
    return {
        query: typedDocumentNode,
        data,
        variables,
    };
}

export function createMock<Query, Variables>(mockedResponse: {
    request: { query: TypedDocumentNode<Query, Variables>; variables?: Variables };
    result?: FetchResult<Query> | ResultFunction<FetchResult<Query>>;
    error?: Error;
    delay?: number;
    newData?: ResultFunction<FetchResult>;
}): MockedResponse<Query> {
    return mockedResponse;
}

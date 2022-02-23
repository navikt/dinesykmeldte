import { DehydratedState } from 'react-query/hydration';
import { QueryState } from 'react-query/types/core/query';
import { QueryKey } from 'react-query/types/core/types';

import {
    ArbeidsrelatertArsakEnum,
    MineSykmeldteQuery,
    FravarstypeEnum,
    PreviewSoknad_PreviewFremtidigSoknad_Fragment,
    PreviewSoknad_PreviewKorrigertSoknad_Fragment,
    PreviewSoknad_PreviewNySoknad_Fragment,
    PreviewSoknad_PreviewSendtSoknad_Fragment,
    PreviewSykmeldingFragment,
    PreviewSykmeldtFragment,
    SoknadByIdQuery,
    SykmeldingByIdQuery,
    SykmeldingFragment,
    SykmeldingPeriode_AktivitetIkkeMulig_Fragment,
    SykmeldingPeriode_Gradert_Fragment,
    VirksomheterQuery,
    SoknadFragment,
    SykmeldingerByIdsQuery,
    HendelseFragment,
} from '../../graphql/queries/react-query.generated';

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
        frist: '2021-10-22',
        varsel: true,
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
        perioder: [],
        ...overrides,
    };
}

export function createPreviewSykmelding(overrides?: Partial<PreviewSykmeldingFragment>): PreviewSykmeldingFragment {
    return {
        id: 'default-sykmelding-1',
        fom: '2021-10-01',
        tom: '2021-10-20',
        type: '100%',
        lest: false,
        ...overrides,
    };
}

export function createHendelse(overrides?: Partial<HendelseFragment>): HendelseFragment {
    return {
        id: '41e890b3-a9e4-4246-8ad2-aac208ef9a93',
        tekst: 'Fake hendelse tekst, hello',
        lenke: 'example.com/test',
        oppgavetype: 'EXAMPLE',
        ...overrides,
    };
}

export function createSoknad(): SoknadFragment {
    return {
        id: 'soknad-id',
        sykmeldingId: 'default-sykmelding-1',
        fnr: '03097722411',
        navn: 'Test person',
        fom: '2021-03-01',
        tom: '2021-06-23',
        lest: false,
        korrigertBySoknadId: '525642-4425fg-55226-7gereg-432424fjz',
        fravar: [
            {
                fom: '2021-11-01',
                tom: '2021-11-08',
                type: FravarstypeEnum.Permisjon,
            },
        ],
    };
}

export function createSykmelding(overrides?: Partial<SykmeldingFragment>): SykmeldingFragment {
    return {
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
        navn: 'Ola Normann',
        fnr: '08088012345',
        orgnummer: '123456789',
        friskmeldt: false,
        narmestelederId: 'narmesteleder-1',
        startdatoSykefravar: '2021-06-07',
        previewSykmeldinger: [createPreviewSykmelding()],
        previewSoknader: [],
        hendelser: [],
        ...overrides,
    };
}

export function createVirksomhet(
    overrides?: Partial<VirksomheterQuery['virksomheter'][0]>,
): VirksomheterQuery['virksomheter'][0] {
    return {
        navn: 'Virksomhet 1',
        orgnummer: '123456789',
        ...overrides,
    };
}

export interface DehydratedQuery<Data> {
    queryHash: string;
    queryKey: QueryKey;
    state: QueryState<Data>;
}

export function createMineSykmeldtePrefetchState(
    overrides?: Partial<QueryState<MineSykmeldteQuery>>,
): DehydratedQuery<MineSykmeldteQuery> {
    return {
        state: {
            data: {
                mineSykmeldte: [createPreviewSykmeldt()],
            },
            dataUpdateCount: 1,
            dataUpdatedAt: 1637931756907,
            error: null,
            errorUpdateCount: 0,
            errorUpdatedAt: 0,
            fetchFailureCount: 0,
            fetchMeta: null,
            isFetching: false,
            isInvalidated: false,
            isPaused: false,
            status: 'success',
            ...overrides,
        },
        queryKey: ['MineSykmeldte'],
        queryHash: '["MineSykmeldte"]',
    };
}

export function createSykmeldingerByIdsPrefetchState(
    ids: string[],
    overrides?: Partial<QueryState<SykmeldingerByIdsQuery>>,
): DehydratedQuery<SykmeldingerByIdsQuery> {
    return {
        state: {
            data: {
                sykmeldinger: ids.map((id) => createSykmelding({ id })),
            },
            dataUpdateCount: 1,
            dataUpdatedAt: 1637931756907,
            error: null,
            errorUpdateCount: 0,
            errorUpdatedAt: 0,
            fetchFailureCount: 0,
            fetchMeta: null,
            isFetching: false,
            isInvalidated: false,
            isPaused: false,
            status: 'success',
            ...overrides,
        },
        queryKey: ['SykmeldingerByIds', { ids }],
        queryHash: `["SykmeldingerByIds",{"ids":[${ids.map((id) => `"${id}"`).join(',')}]}]`,
    };
}

export function createSykmeldingByIdPrefetchState(
    id: string,
    overrides?: Partial<QueryState<SykmeldingByIdQuery>>,
): DehydratedQuery<SykmeldingByIdQuery> {
    return {
        state: {
            data: {
                sykmelding: {
                    ...createSykmelding(),
                    navn: 'Liten Kopp',
                    startdatoSykefravar: '2021-11-02',
                    perioder: [
                        {
                            ...createAktivitetIkkeMuligPeriode({
                                fom: '2021-11-02',
                                tom: '2021-11-03',
                            }),
                        },
                        {
                            ...createGradertPeriode({
                                fom: '2021-11-04',
                                tom: '2021-11-05',
                            }),
                        },
                        {
                            __typename: 'Avventende',
                            fom: '2021-11-06',
                            tom: '2021-11-07',
                            tilrettelegging: 'Må ha ekstra lange pauser',
                        },
                        {
                            __typename: 'Behandlingsdager',
                            fom: '2021-11-09',
                            tom: '2021-11-10',
                            behandlingsdager: 1,
                        },
                        {
                            __typename: 'Reisetilskudd',
                            fom: '2021-11-12',
                            tom: '2021-11-13',
                        },
                    ],
                },
                ...overrides,
            },
            dataUpdateCount: 1,
            dataUpdatedAt: 1638955196656,
            error: null,
            errorUpdateCount: 0,
            errorUpdatedAt: 0,
            fetchFailureCount: 0,
            fetchMeta: null,
            isFetching: false,
            isInvalidated: false,
            isPaused: false,
            status: 'success',
        },
        queryKey: ['SykmeldingById', { sykmeldingId: id }],
        queryHash: `["SykmeldingById",{"sykmeldingId":"${id}"}]`,
    };
}

export function createSoknadByIdPrefetchState(
    id: string,
    overrides?: Partial<QueryState<SoknadByIdQuery>>,
): DehydratedQuery<SoknadByIdQuery> {
    return {
        state: {
            data: {
                soknad: {
                    id: 'soknad-id',
                    sykmeldingId: 'default-sykmelding-1',
                    fnr: '03097722411',
                    navn: 'Liten Kopp',
                    fom: '2021-11-01',
                    tom: '2021-11-08',
                    lest: false,
                    korrigertBySoknadId: '525642-4425fg-55226-7gereg-432424fjz',
                    fravar: [
                        {
                            fom: '2021-11-01',
                            tom: '2021-11-08',
                            type: FravarstypeEnum.Ferie,
                        },
                    ],
                },
            },
            dataUpdateCount: 1,
            dataUpdatedAt: 1637923568649,
            error: null,
            errorUpdateCount: 0,
            errorUpdatedAt: 0,
            fetchFailureCount: 0,
            fetchMeta: null,
            isFetching: false,
            isInvalidated: false,
            isPaused: false,
            status: 'success',
            ...overrides,
        },
        queryKey: ['SoknadById', { soknadId: id }],
        queryHash: `["SoknadById",{"soknadId":"${id}"}]`,
    };
}

export function createVirksomheterPrefetchState(
    overrides?: Partial<QueryState<VirksomheterQuery>>,
): DehydratedQuery<VirksomheterQuery> {
    return {
        state: {
            data: {
                virksomheter: [createVirksomhet()],
            },
            dataUpdateCount: 1,
            dataUpdatedAt: 1642510330880,
            error: null,
            errorUpdateCount: 0,
            errorUpdatedAt: 0,
            fetchFailureCount: 0,
            fetchMeta: null,
            isFetching: false,
            isInvalidated: false,
            isPaused: false,
            status: 'success',
            ...overrides,
        },
        queryKey: ['Virksomheter'],
        queryHash: '["Virksomheter"]',
    };
}

export function createDehydratedState(overrides: Partial<DehydratedState>): DehydratedState {
    return {
        mutations: [],
        queries: [createMineSykmeldtePrefetchState()],
        ...overrides,
    };
}

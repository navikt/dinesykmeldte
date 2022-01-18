import mockRouter from 'next-router-mock';
import * as dekoratoren from '@navikt/nav-dekoratoren-moduler';

import { createMockedSsrContext, HappyPathSsrResult, nock, render, waitFor } from '../../../../utils/test/testUtils';
import { MarkSykmeldingReadDocument } from '../../../../graphql/queries/react-query.generated';
import { overrideWindowLocation } from '../../../../utils/test/locationUtils';
import { createMineSykmeldtePrefetchState } from '../../../../utils/test/dataCreators';

import Sykmelding, { getServerSideProps } from './[sykmeldingId].page';

const prefetchState = {
    mutations: [],
    queries: [
        createMineSykmeldtePrefetchState({
            data: {
                mineSykmeldte: [
                    {
                        fnr: '12r398123012',
                        navn: 'Liten Kopp',
                        orgnummer: '896929119',
                        friskmeldt: false,
                        narmestelederId: 'test-sykmeldt-id',
                        startdatoSykefravar: '2021-11-02',
                        previewSykmeldinger: [],
                        previewSoknader: [],
                    },
                ],
            },
        }),
        {
            state: {
                data: {
                    sykmelding: {
                        id: '8317b5df-0a42-4b2b-a1de-fccbd9aca63a',
                        fnr: '03097722411',
                        lest: false,
                        navn: 'Liten Kopp',
                        startdatoSykefravar: '2021-11-02',
                        arbeidsforEtterPeriode: true,
                        tiltakArbeidsplassen: 'Fortsett som sist.',
                        arbeidsgiver: { navn: 'SAUEFABRIKK', yrke: null },
                        behandler: { navn: 'Frida Perma Frost', telefon: 'tel:94431152' },
                        perioder: [
                            {
                                __typename: 'AktivitetIkkeMulig',
                                fom: '2021-11-02',
                                tom: '2021-11-03',
                                arbeidsrelatertArsak: {
                                    arsak: ['ANNET'],
                                    beskrivelse: 'andre årsaker til sykefravær',
                                },
                            },
                            {
                                __typename: 'Gradert',
                                fom: '2021-11-04',
                                tom: '2021-11-05',
                                grad: 50,
                                reisetilskudd: false,
                            },
                            {
                                __typename: 'Avventende',
                                fom: '2021-11-06',
                                tom: '2021-11-07',
                                tilrettelegging: 'Må ha ekstra lange pauser',
                            },
                            { __typename: 'Behandlingsdager', fom: '2021-11-09', tom: '2021-11-10' },
                            { __typename: 'Reisetilskudd', fom: '2021-11-12', tom: '2021-11-13' },
                        ],
                    },
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
            queryKey: ['SykmeldingById', { sykmeldingId: 'test-sykmelding-id' }],
            queryHash: '["SykmeldingById",{"sykmeldingId":"test-sykmelding-id"}]',
        },
    ],
};

describe('Sykmelding page', () => {
    const currentUrl = '/sykmeldt/test-sykmeldt-id/sykmelding/test-sykmelding-id';

    mockRouter.setCurrentUrl(currentUrl);
    overrideWindowLocation(currentUrl);

    describe('on initial load', () => {
        it('should mark sykmelding as read on load', async () => {
            const scope = mockMarkRead();

            render(<Sykmelding />, { state: prefetchState });

            await waitFor(() => scope.isDone());
        });

        it('should set the correct breadcrumbs', async () => {
            const scope = mockMarkRead();
            const spy = jest.spyOn(dekoratoren, 'setBreadcrumbs');

            render(<Sykmelding />, { state: prefetchState });

            await waitFor(() => scope.isDone());

            expect(spy).toHaveBeenCalledWith([
                { handleInApp: true, title: 'Dine sykmeldte', url: '/' },
                {
                    handleInApp: true,
                    title: 'Liten Kopps sykmeldinger',
                    url: '/sykmeldt/test-sykmeldt-id/sykmeldinger',
                },
                { handleInApp: true, title: 'Sykmelding', url: '/' },
            ]);
        });
    });

    describe('getServerSideProps', () => {
        it('should pre-fetch specific sykmelding by sykmeldingId', async () => {
            const result = (await getServerSideProps(
                createMockedSsrContext({ query: { sykmeldingId: 'test-id' } }),
            )) as unknown as HappyPathSsrResult;

            expect(result.props.dehydratedState.queries[0].queryKey).toEqual([
                'SykmeldingById',
                { sykmeldingId: 'test-id' },
            ]);
        });
    });
});

function mockMarkRead(): ReturnType<typeof nock> {
    return nock()
        .post(
            '/api/graphql',
            JSON.stringify({ query: MarkSykmeldingReadDocument, variables: { sykmeldingId: 'test-sykmelding-id' } }),
        )
        .reply(200, { data: { message: 'ok' } });
}

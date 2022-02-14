import mockRouter from 'next-router-mock';
import * as dekoratoren from '@navikt/nav-dekoratoren-moduler';
import { DehydratedState } from 'react-query/hydration';

import { createMockedSsrContext, HappyPathSsrResult, nock, render } from '../../../../utils/test/testUtils';
import { MarkSykmeldingReadDocument } from '../../../../graphql/queries/react-query.generated';
import { overrideWindowLocation } from '../../../../utils/test/locationUtils';
import {
    createDehydratedState,
    createMineSykmeldtePrefetchState,
    createSykmeldingByIdPrefetchState,
} from '../../../../utils/test/dataCreators';

import Sykmelding, { getServerSideProps } from './[sykmeldingId].page';

const prefetchState: DehydratedState = createDehydratedState({
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
        createSykmeldingByIdPrefetchState('test-sykmelding-id'),
    ],
});

describe('Sykmelding page', () => {
    const currentUrl = '/sykmeldt/test-sykmeldt-id/sykmelding/test-sykmelding-id';

    mockRouter.setCurrentUrl(currentUrl);
    overrideWindowLocation(currentUrl);

    describe('on initial load', () => {
        it('should mark sykmelding as read on load', async () => {
            const scope = mockMarkRead();

            render(<Sykmelding />, { state: prefetchState });

            await expect(scope).toHaveNoMoreMocks();
        });

        it('should set the correct breadcrumbs', async () => {
            const scope = mockMarkRead();
            const spy = jest.spyOn(dekoratoren, 'setBreadcrumbs');

            render(<Sykmelding />, { state: prefetchState });

            await expect(scope).toHaveNoMoreMocks();

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
                createMockedSsrContext({ query: { sykmeldingId: '8317b5df-0a42-4b2b-a1de-fccbd9aca63a' } }),
            )) as unknown as HappyPathSsrResult;

            expect(result.props.dehydratedState.queries[0].queryKey).toEqual([
                'SykmeldingById',
                { sykmeldingId: '8317b5df-0a42-4b2b-a1de-fccbd9aca63a' },
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

import mockRouter from 'next-router-mock';
import * as dekoratoren from '@navikt/nav-dekoratoren-moduler';
import { DehydratedState } from 'react-query/hydration';

import { createMockedSsrContext, HappyPathSsrResult, nock, render } from '../../../../utils/test/testUtils';
import { MarkSoknadReadDocument } from '../../../../graphql/queries/react-query.generated';
import { overrideWindowLocation } from '../../../../utils/test/locationUtils';
import {
    createDehydratedState,
    createMineSykmeldtePrefetchState,
    createPreviewSykmelding,
    createPreviewSykmeldt,
    createSoknadByIdPrefetchState,
    createSykmeldingByIdPrefetchState,
} from '../../../../utils/test/dataCreators';

import Soknad, { getServerSideProps } from './[soknadId].page';

const prefetchState: DehydratedState = createDehydratedState({
    queries: [
        createMineSykmeldtePrefetchState({
            data: {
                mineSykmeldte: [
                    createPreviewSykmeldt({
                        fnr: '12r398123012',
                        navn: 'Liten Kopp',
                        orgnummer: '896929119',
                        friskmeldt: false,
                        narmestelederId: 'test-sykmeldt-id',
                        startdatoSykefravar: '2021-11-02',
                        previewSykmeldinger: [createPreviewSykmelding()],
                    }),
                ],
            },
        }),
        createSoknadByIdPrefetchState('test-soknad-id'),
        createSykmeldingByIdPrefetchState('default-sykmelding-1'),
    ],
});

describe('Søknad page', () => {
    const currentUrl = '/sykmeldt/test-sykmeldt-id/soknad/test-soknad-id';

    mockRouter.setCurrentUrl(currentUrl);
    overrideWindowLocation(currentUrl);

    it('should mark sykmelding as read on page load', async () => {
        const scope = mockMarkRead();

        render(<Soknad />, { state: prefetchState });

        await expect(scope).toHaveNoMoreMocks();
    });

    it('should set the correct breadcrumbs', async () => {
        const scope = mockMarkRead();
        const spy = jest.spyOn(dekoratoren, 'setBreadcrumbs');

        render(<Soknad />, { state: prefetchState });

        await expect(scope).toHaveNoMoreMocks();

        expect(spy).toHaveBeenCalledWith([
            { handleInApp: true, title: 'Dine sykmeldte', url: '/' },
            { handleInApp: true, title: 'Liten Kopps søknader', url: '/sykmeldt/test-sykmeldt-id/soknader' },
            { handleInApp: true, title: 'Søknad', url: '/' },
        ]);
    });

    describe('getServerSideProps', () => {
        it('should pre-fetch specific sykmelding by sykmeldingId', async () => {
            mockMarkRead();

            const result = (await getServerSideProps(
                createMockedSsrContext({ query: { soknadId: '01206017-dbcf-4f35-ac1f-8cbd2f76d012' } }),
            )) as unknown as HappyPathSsrResult;

            expect(result.props.dehydratedState.queries[0].queryKey).toEqual([
                'SoknadById',
                { soknadId: '01206017-dbcf-4f35-ac1f-8cbd2f76d012' },
            ]);
        });
    });
});

function mockMarkRead(): ReturnType<typeof nock> {
    return nock()
        .post(
            '/api/graphql',
            JSON.stringify({ query: MarkSoknadReadDocument, variables: { soknadId: 'test-soknad-id' } }),
        )
        .reply(200, { data: { message: 'ok' } });
}

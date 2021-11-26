import mockRouter from 'next-router-mock';
import { Hydrate } from 'react-query';
import * as dekoratoren from '@navikt/nav-dekoratoren-moduler';

import { nock, render, waitFor } from '../../../../utils/test/testUtils';
import { MarkSoknadReadDocument } from '../../../../graphql/queries/react-query.generated';
import { overrideWindowLocation } from '../../../../utils/test/locationUtils';

import Soknad from './[soknadId].page';

const prefetchState = {
    mutations: [],
    queries: [
        {
            state: {
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
            },
            queryKey: ['MineSykmeldte'],
            queryHash: '["MineSykmeldte"]',
        },
        {
            state: {
                data: {
                    soknad: { id: '01206017-dbcf-4f35-ac1f-8cbd2f76d012', fnr: '03097722411', lest: false },
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
            },
            queryKey: ['SoknadById', { soknadId: 'test-soknad-id' }],
            queryHash: '["SoknadById",{"soknadId":"test-soknad-id"}]',
        },
    ],
};

describe('Søknad page', () => {
    const currentUrl = '/sykmeldt/test-sykmeldt-id/soknad/test-soknad-id';

    mockRouter.setCurrentUrl(currentUrl);
    overrideWindowLocation(currentUrl);

    it('should mark sykmelding as read on page load', async () => {
        const scope = mockMarkRead();

        render(
            <Hydrate state={prefetchState}>
                <Soknad />
            </Hydrate>,
        );

        await waitFor(() => scope.isDone());
    });

    it('should set the correct breadcrumbs', async () => {
        const scope = mockMarkRead();
        const spy = jest.spyOn(dekoratoren, 'setBreadcrumbs');

        render(
            <Hydrate state={prefetchState}>
                <Soknad />
            </Hydrate>,
        );

        await waitFor(() => scope.isDone());

        expect(spy).toHaveBeenCalledWith([
            { handleInApp: true, title: 'Dine sykmeldte', url: '/test/root' },
            { handleInApp: true, title: 'Liten Kopps søknader', url: '/test/root/sykmeldt/test-sykmeldt-id/soknader' },
            { handleInApp: true, title: 'Søknad', url: '/test/root/sykmeldt/test-sykmeldt-id/soknad/test-soknad-id' },
        ]);
    });
});

function mockMarkRead() {
    return nock()
        .post(
            '/api/graphql',
            JSON.stringify({ query: MarkSoknadReadDocument, variables: { soknadId: 'test-soknad-id' } }),
        )
        .reply(200, { data: { message: 'ok' } });
}

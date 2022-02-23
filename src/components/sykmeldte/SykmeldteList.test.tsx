import userEvent from '@testing-library/user-event';
import { within } from '@testing-library/react';

import { nock, render, screen } from '../../utils/test/testUtils';
import { PreviewSykmeldtFragment, useMineSykmeldteQuery } from '../../graphql/queries/react-query.generated';
import {
    createDehydratedState,
    createMineSykmeldtePrefetchState,
    createPreviewSykmelding,
    createPreviewSykmeldt,
    createSykmeldingerByIdsPrefetchState,
    createVirksomhet,
    createVirksomheterPrefetchState,
    DehydratedQuery,
} from '../../utils/test/dataCreators';

import SykmeldteList from './SykmeldteList';

describe('SykmeldteList', () => {
    function setup(queries: DehydratedQuery<unknown>[] = [createVirksomheterPrefetchState()]): void {
        render(<SykmeldteList />, {
            state: createDehydratedState({ queries: [...queries] }),
        });
    }

    it('should show loading spinner', () => {
        nock().post('/api/graphql', { query: useMineSykmeldteQuery.document }).reply(200, { data: [] });
        setup();

        expect(screen.getByTitle('Laster dine ansatte')).toBeInTheDocument();
    });

    it('should show error when unable to fetch', async () => {
        nock()
            .post('/api/graphql', { query: useMineSykmeldteQuery.document })
            .reply(200, { errors: [{ message: 'Something went wrong' }], data: null });

        setup();

        expect(await screen.findByText('Klarte ikke å hente ansatte: Something went wrong')).toBeInTheDocument();
    });

    it('should list sykmeldte on successful fetch', async () => {
        nock()
            .post('/api/graphql', { query: useMineSykmeldteQuery.document })
            .reply(200, {
                data: {
                    mineSykmeldte: [
                        createPreviewSykmeldt({ navn: 'Kari Normann', fnr: '1' }),
                        createPreviewSykmeldt({ navn: 'Ola Normann', fnr: '2' }),
                    ],
                },
            });

        setup();

        expect(await screen.findByText('Kari Normann')).toBeInTheDocument();
    });

    it('should expand and close the panel when clicked', () => {
        setup([
            createVirksomheterPrefetchState(),
            createMineSykmeldtePrefetchState(),
            createSykmeldingerByIdsPrefetchState(['default-sykmelding-1']),
        ]);

        userEvent.click(screen.getByRole('button', { name: /Ola Normann/ }));

        expect(screen.getByRole('link', { name: /Sykmeldinger/ })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /Søknader/ })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /Dialogmøter/ })).toBeInTheDocument();

        userEvent.click(screen.getByRole('button', { name: /Ola Normann/ }));

        expect(screen.queryByRole('link', { name: /Sykmeldinger/ })).not.toBeInTheDocument();
        expect(screen.queryByRole('link', { name: /Søknader/ })).not.toBeInTheDocument();
        expect(screen.queryByRole('link', { name: /Dialogmøter/ })).not.toBeInTheDocument();
    });

    it('should expand sykmelding periode summary and show content', () => {
        setup([
            createVirksomheterPrefetchState(),
            createMineSykmeldtePrefetchState(),
            createSykmeldingerByIdsPrefetchState(['default-sykmelding-1']),
        ]);

        userEvent.click(screen.getByRole('button', { name: /Ola Normann/ }));
        userEvent.click(screen.getByRole('button', { name: /Ola er 100% sykmeldt/ }));

        const table = within(screen.getByRole('table'));
        const cells = table.getAllByRole('cell');

        expect(cells[0]).toHaveTextContent('8 - 15. august 2021');
        expect(cells[1]).toHaveTextContent('100%');
        expect(cells[2]).toHaveTextContent('Ferdig');
    });

    it('should filter by the active virksomhet', () => {
        setup([
            createMineSykmeldtePrefetchState({
                data: {
                    mineSykmeldte: [
                        createPreviewSykmeldt({ navn: 'Mr. Show', orgnummer: 'org-1' }),
                        createPreviewSykmeldt({ navn: 'Ms. Hide', orgnummer: 'org-2' }),
                    ],
                },
            }),
            createVirksomheterPrefetchState({
                data: {
                    virksomheter: [createVirksomhet({ orgnummer: 'org-1' }), createVirksomhet({ orgnummer: 'org-2' })],
                },
            }),
        ]);

        expect(screen.getByRole('heading', { name: 'Mr. Show' })).toBeInTheDocument();
        expect(screen.queryByRole('heading', { name: 'Ms. Hide' })).not.toBeInTheDocument();
    });

    it('should group sykmeldte by notifying status', () => {
        const sykmeldte: PreviewSykmeldtFragment[] = [
            createPreviewSykmeldt({
                navn: 'Mr. Notifying',
                previewSykmeldinger: [createPreviewSykmelding({ lest: false })],
            }),
            createPreviewSykmeldt({
                navn: 'Ms. Read',
                previewSykmeldinger: [createPreviewSykmelding({ lest: true })],
            }),
        ];
        setup([
            createVirksomheterPrefetchState(),
            createMineSykmeldtePrefetchState({ data: { mineSykmeldte: sykmeldte } }),
        ]);

        const notifyingSection = within(screen.getByRole('region', { name: 'Nye varsler' }));
        expect(notifyingSection.getAllByRole('button')).toHaveLength(1);
        expect(notifyingSection.getByRole('button', { name: /Mr. Notifying/ })).toBeInTheDocument();

        const nonNotifyingSection = within(screen.getByRole('region', { name: 'Sykmeldte uten varsel' }));
        expect(nonNotifyingSection.getAllByRole('button')).toHaveLength(1);
        expect(nonNotifyingSection.getByRole('button', { name: /Ms. Read/ })).toBeInTheDocument();
    });
});

import userEvent from '@testing-library/user-event';
import { waitForElementToBeRemoved, within } from '@testing-library/react';
import { Cache } from '@apollo/client';
import { MockedResponse } from '@apollo/client/testing';

import { render, screen } from '../../utils/test/testUtils';
import {
    MineSykmeldteDocument,
    PreviewSykmeldtFragment,
    SykmeldingerByIdsDocument,
    VirksomheterDocument,
} from '../../graphql/queries/graphql.generated';
import {
    createInitialQuery,
    createMock,
    createPreviewSykmelding,
    createPreviewSykmeldt,
    createSykmelding,
    createVirksomhet,
} from '../../utils/test/dataCreators';

import SykmeldteList from './SykmeldteList';

describe('SykmeldteList', () => {
    function setup(
        initialState: Cache.WriteQueryOptions<unknown, unknown>[] = [
            createInitialQuery(VirksomheterDocument, { virksomheter: [createVirksomhet()] }),
        ],
        mocks: MockedResponse[] = [],
    ): void {
        render(<SykmeldteList />, {
            initialState,
            mocks,
        });
    }

    it('should show loading spinner', async () => {
        const mockMineSykmeldte = createMock({
            request: { query: MineSykmeldteDocument },
            result: { data: { mineSykmeldte: [] } },
        });

        setup(undefined, [mockMineSykmeldte]);

        expect(screen.getByTitle('Laster dine ansatte')).toBeInTheDocument();
        await waitForElementToBeRemoved(() => screen.queryByTitle('Laster dine ansatte'));
    });

    it('should show error when unable to fetch', async () => {
        const mockMineSykmeldte = createMock({
            request: { query: MineSykmeldteDocument },
            error: new Error('Something went wrong'),
        });

        setup(undefined, [mockMineSykmeldte]);

        expect(await screen.findByText('Klarte ikke å hente ansatte: Something went wrong')).toBeInTheDocument();
    });

    it('should list sykmeldte on successful fetch', async () => {
        const mockMineSykmeldte = createMock({
            request: { query: MineSykmeldteDocument },
            result: {
                data: {
                    mineSykmeldte: [
                        createPreviewSykmeldt({ navn: 'Kari Normann', fnr: '1' }),
                        createPreviewSykmeldt({ navn: 'Ola Normann', fnr: '2' }),
                    ],
                },
            },
        });

        setup(undefined, [mockMineSykmeldte]);

        expect(await screen.findByText('Kari Normann')).toBeInTheDocument();
        expect(await screen.findByText('Ola Normann')).toBeInTheDocument();
    });

    it('should expand and close the panel when clicked', () => {
        setup([
            createInitialQuery(VirksomheterDocument, { virksomheter: [createVirksomhet()] }),
            createInitialQuery(MineSykmeldteDocument, { mineSykmeldte: [createPreviewSykmeldt()] }),
            createInitialQuery(
                SykmeldingerByIdsDocument,
                {
                    sykmeldinger: [createSykmelding({ id: 'default-sykmelding-1' })],
                },
                { ids: ['default-sykmelding-1'] },
            ),
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
            createInitialQuery(VirksomheterDocument, { virksomheter: [createVirksomhet()] }),
            createInitialQuery(MineSykmeldteDocument, { mineSykmeldte: [createPreviewSykmeldt()] }),
            createInitialQuery(
                SykmeldingerByIdsDocument,
                {
                    sykmeldinger: [createSykmelding({ id: 'default-sykmelding-1' })],
                },
                { ids: ['default-sykmelding-1'] },
            ),
        ]);

        userEvent.click(screen.getByRole('button', { name: /Ola Normann/ }));
        userEvent.click(screen.getByRole('button', { name: /Ola var sist sykmeldt 8. august 2021 - 15. august 2021/ }));

        const table = within(screen.getByRole('table'));
        const cells = table.getAllByRole('cell');

        expect(cells[0]).toHaveTextContent('8 - 15. august 2021');
        expect(cells[1]).toHaveTextContent('100%');
        expect(cells[2]).toHaveTextContent('Ferdig');
    });

    it('should filter by the active virksomhet', () => {
        setup([
            createInitialQuery(VirksomheterDocument, {
                virksomheter: [createVirksomhet({ orgnummer: 'org-1' }), createVirksomhet({ orgnummer: 'org-2' })],
            }),
            createInitialQuery(MineSykmeldteDocument, {
                mineSykmeldte: [
                    createPreviewSykmeldt({ fnr: '1', navn: 'Mr. Show', orgnummer: 'org-1' }),
                    createPreviewSykmeldt({ fnr: '2', navn: 'Ms. Hide', orgnummer: 'org-2' }),
                ],
            }),
        ]);

        expect(screen.getByRole('heading', { name: 'Mr. Show' })).toBeInTheDocument();
        expect(screen.queryByRole('heading', { name: 'Ms. Hide' })).not.toBeInTheDocument();
    });

    it('should group sykmeldte by notifying status', () => {
        const sykmeldte: PreviewSykmeldtFragment[] = [
            createPreviewSykmeldt({
                fnr: '1',
                navn: 'Mr. Notifying',
                previewSykmeldinger: [createPreviewSykmelding({ id: 'sykme-1', lest: false })],
            }),
            createPreviewSykmeldt({
                fnr: '2',
                navn: 'Ms. Read',
                previewSykmeldinger: [createPreviewSykmelding({ id: 'sykme-2', lest: true })],
            }),
        ];
        setup([
            createInitialQuery(VirksomheterDocument, { virksomheter: [createVirksomhet()] }),
            createInitialQuery(MineSykmeldteDocument, { mineSykmeldte: sykmeldte }),
        ]);

        const notifyingSection = within(screen.getByRole('region', { name: 'Nye varsler' }));
        expect(notifyingSection.getAllByRole('button')).toHaveLength(1);
        expect(notifyingSection.getByRole('button', { name: /Mr. Notifying/ })).toBeInTheDocument();

        const nonNotifyingSection = within(screen.getByRole('region', { name: 'Sykmeldte uten varsel' }));
        expect(nonNotifyingSection.getAllByRole('button')).toHaveLength(1);
        expect(nonNotifyingSection.getByRole('button', { name: /Ms. Read/ })).toBeInTheDocument();
    });
});

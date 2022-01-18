import userEvent from '@testing-library/user-event';

import { nock, render, screen } from '../../utils/test/testUtils';
import { useMineSykmeldteQuery } from '../../graphql/queries/react-query.generated';
import {
    createDehydratedState,
    createMineSykmeldtePrefetchState,
    createPreviewSykmeldt,
    createVirksomheterPrefetchState,
} from '../../utils/test/dataCreators';

import SykmeldteList from './SykmeldteList';

describe('SykmeldteList', () => {
    it('should show loading spinner', () => {
        nock().post('/api/graphql', { query: useMineSykmeldteQuery.document }).reply(200, { data: [] });

        render(<SykmeldteList />, {
            state: createDehydratedState({ queries: [createVirksomheterPrefetchState()] }),
        });

        expect(screen.getByTitle('Laster dine ansatte')).toBeInTheDocument();
    });

    it('should show error when unable to fetch', async () => {
        nock()
            .post('/api/graphql', {
                query: useMineSykmeldteQuery.document,
            })
            .reply(200, {
                errors: [{ message: 'Something went wrong' }],
                data: null,
            });

        render(<SykmeldteList />, {
            state: createDehydratedState({ queries: [createVirksomheterPrefetchState()] }),
        });

        expect(await screen.findByText('Klarte ikke å hente ansatte: Something went wrong')).toBeInTheDocument();
    });

    it('should list sykmeldte on successful fetch', async () => {
        nock()
            .post('/api/graphql', {
                query: useMineSykmeldteQuery.document,
            })
            .reply(200, {
                data: {
                    mineSykmeldte: [
                        createPreviewSykmeldt({ navn: 'Kari Normann', fnr: '1' }),
                        createPreviewSykmeldt({ navn: 'Ola Normann', fnr: '2' }),
                    ],
                },
            });

        render(<SykmeldteList />, {
            state: createDehydratedState({ queries: [createVirksomheterPrefetchState()] }),
        });

        expect(await screen.findByText('Kari Normann')).toBeInTheDocument();
    });

    it('should expand and close the panel when clicked', () => {
        render(<SykmeldteList />, {
            state: createDehydratedState({
                queries: [createMineSykmeldtePrefetchState(), createVirksomheterPrefetchState()],
            }),
        });

        userEvent.click(screen.getByRole('button', { name: /Ola Normann/ }));

        expect(screen.getByRole('link', { name: /Sykmeldinger/ })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /Søknader/ })).toBeInTheDocument();

        userEvent.click(screen.getByRole('button', { name: /Ola Normann/ }));

        expect(screen.queryByRole('link', { name: /Sykmeldinger/ })).not.toBeInTheDocument();
        expect(screen.queryByRole('link', { name: /Søknader/ })).not.toBeInTheDocument();
    });
});

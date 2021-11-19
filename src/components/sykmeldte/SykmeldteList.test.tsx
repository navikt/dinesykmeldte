import { nock, render, screen } from '../../utils/test/testUtils';
import { useMineSykmeldteQuery } from '../../graphql/queries/react-query.generated';
import { createPreviewSykmeldt } from '../../utils/test/dataCreators';

import SykmeldteList from './SykmeldteList';

describe('SykmeldteList', () => {
    it('should show loading spinner', () => {
        nock().post('/api/graphql', { query: useMineSykmeldteQuery.document }).reply(200, { data: [] });

        render(<SykmeldteList />);

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

        render(<SykmeldteList />);

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

        render(<SykmeldteList />);

        expect(await screen.findByText('Kari Normann')).toBeInTheDocument();
    });
});

import {
    createDehydratedState,
    createPreviewSykmelding,
    createPreviewSykmeldt,
    createSykmelding,
    createSykmeldingByIdPrefetchState,
} from '../../utils/test/dataCreators';
import { nock, render, screen, within } from '../../utils/test/testUtils';
import { useSykmeldingByIdQuery } from '../../graphql/queries/react-query.generated';

import SykmeldingerList from './SykmeldingerList';

describe('SykmeldingerList', () => {
    it('should render sykmeldinger in sections according to lest status', () => {
        render(
            <SykmeldingerList
                sykmeldtId="test-id"
                sykmeldt={createPreviewSykmeldt({
                    previewSykmeldinger: [
                        createPreviewSykmelding({ id: 'sykmelding-1', lest: false }),
                        createPreviewSykmelding({ id: 'sykmelding-2', lest: true }),
                        createPreviewSykmelding({ id: 'sykmelding-2', lest: false }),
                    ],
                })}
            />,
            {
                state: createDehydratedState({
                    queries: [
                        createSykmeldingByIdPrefetchState('sykmelding-1'),
                        createSykmeldingByIdPrefetchState('sykmelding-2'),
                        createSykmeldingByIdPrefetchState('sykmelding-3'),
                    ],
                }),
            },
        );

        const unreadSection = within(screen.getByRole('region', { name: 'Uleste' }));
        expect(unreadSection.getAllByRole('link', { name: /Sykmelding/ })).toHaveLength(2);

        const readSection = within(screen.getByRole('region', { name: 'Leste' }));
        expect(readSection.getAllByRole('link', { name: /Sykmelding/ })).toHaveLength(1);
    });

    it('should link to the correct path', () => {
        render(
            <SykmeldingerList
                sykmeldtId="test-id"
                sykmeldt={createPreviewSykmeldt({
                    previewSykmeldinger: [createPreviewSykmelding({ id: 'sykmelding-1' })],
                })}
            />,
            {
                state: createDehydratedState({ queries: [createSykmeldingByIdPrefetchState('sykmelding-1')] }),
            },
        );

        expect(screen.getByRole('link', { name: /Sykmelding/ })).toHaveAttribute(
            'href',
            '/sykmeldt/test-id/sykmelding/sykmelding-1',
        );
    });

    it('should lazy load period description', async () => {
        const scope = nock()
            .post('/api/graphql', {
                query: useSykmeldingByIdQuery.document,
                variables: { sykmeldingId: 'sykmelding-1' },
            })
            .reply(200, {
                data: {
                    sykmelding: createSykmelding(),
                },
            });

        render(
            <SykmeldingerList
                sykmeldtId="test-id"
                sykmeldt={createPreviewSykmeldt({
                    previewSykmeldinger: [createPreviewSykmelding({ id: 'sykmelding-1' })],
                })}
            />,
        );

        await expect(scope).toHaveNoMoreMocks();
        expect(await screen.findByRole('link', { name: /100% sykmeldt i 8 dager/ }));
    });
});

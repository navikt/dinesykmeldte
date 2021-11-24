import { within } from '@testing-library/dom';

import { createPreviewSykmelding, createPreviewSykmeldt } from '../../utils/test/dataCreators';
import { render, screen } from '../../utils/test/testUtils';

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
        );

        const unreadSection = within(screen.getByRole('region', { name: 'Uleste sykmeldinger' }));
        expect(unreadSection.getAllByRole('link', { name: /Sykmelding/ })).toHaveLength(2);

        const readSection = within(screen.getByRole('region', { name: 'Leste sykmeldinger' }));
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
        );

        expect(screen.getByRole('link', { name: /Sykmelding/ })).toHaveAttribute(
            'href',
            '/sykmeldt/test-id/sykmelding/sykmelding-1',
        );
    });
});

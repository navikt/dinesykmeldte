import { within } from '@testing-library/dom';

import { createPreviewSoknad, createPreviewSykmeldt } from '../../utils/test/dataCreators';
import { render, screen } from '../../utils/test/testUtils';

import SoknaderList from './SoknaderList';

describe('SoknaderList', () => {
    it('should render søknader in sections according to lest status', () => {
        render(
            <SoknaderList
                sykmeldtId="test-id"
                sykmeldt={createPreviewSykmeldt({
                    previewSoknader: [
                        createPreviewSoknad({ id: 'soknad-1', lest: false }),
                        createPreviewSoknad({ id: 'soknad-2', lest: true }),
                        createPreviewSoknad({ id: 'soknad-2', lest: false }),
                    ],
                })}
            />,
        );

        const unreadSection = within(screen.getByRole('region', { name: 'Uleste søknader' }));
        expect(unreadSection.getAllByRole('link', { name: /Søknad/ })).toHaveLength(2);

        const readSection = within(screen.getByRole('region', { name: 'Leste søknader' }));
        expect(readSection.getAllByRole('link', { name: /Søknad/ })).toHaveLength(1);
    });

    it('should link to the correct path', () => {
        render(
            <SoknaderList
                sykmeldtId="test-id"
                sykmeldt={createPreviewSykmeldt({
                    previewSoknader: [createPreviewSoknad({ id: 'soknad-1' })],
                })}
            />,
        );

        expect(screen.getByRole('link', { name: /Søknad/ })).toHaveAttribute(
            'href',
            '/sykmeldt/test-id/soknad/soknad-1',
        );
    });
});

import {
    createPreviewFremtidigSoknad,
    createPreviewNySoknad,
    createPreviewSendtSoknad,
    createPreviewSykmeldt,
} from '../../utils/test/dataCreators';
import { render, screen, within } from '../../utils/test/testUtils';

import SoknaderList from './SoknaderList';

describe('SoknaderList', () => {
    it('should render søknader in sections according to status', () => {
        render(
            <SoknaderList
                sykmeldtId="test-id"
                sykmeldt={createPreviewSykmeldt({
                    previewSoknader: [
                        createPreviewFremtidigSoknad({ id: 'soknad-1' }),
                        createPreviewNySoknad({ id: 'soknad-2' }),
                        createPreviewSendtSoknad({ id: 'soknad-4', lest: false }),
                    ],
                })}
            />,
        );

        const fremtidigSection = within(screen.getByRole('region', { name: 'Planlagte søknader' }));
        expect(fremtidigSection.getAllByRole('button', { name: /Søknad/ })).toHaveLength(1);

        const nySection = within(screen.getByRole('region', { name: 'Til utfylling' }));
        expect(nySection.getAllByRole('button', { name: /Søknad/ })).toHaveLength(1);

        const sendtSection = within(screen.getByRole('region', { name: 'Sendte søknader' }));
        expect(sendtSection.getAllByRole('link', { name: /Søknad/ })).toHaveLength(1);
    });

    it('should link to the correct path', () => {
        render(
            <SoknaderList
                sykmeldtId="test-id"
                sykmeldt={createPreviewSykmeldt({
                    previewSoknader: [createPreviewSendtSoknad({ id: 'soknad-1' })],
                })}
            />,
        );

        expect(screen.getByRole('link', { name: /Søknad/ })).toHaveAttribute(
            'href',
            '/sykmeldt/test-id/soknad/soknad-1',
        );
    });
});

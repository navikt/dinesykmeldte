import {
    createPreviewSoknad,
    createPreviewSykmelding,
    createPreviewSykmeldt,
} from '../../../../utils/test/dataCreators';
import { render, screen } from '../../../../utils/test/testUtils';

import SykmeldtCard from './SykmeldtCard';

describe('SykmeldtCard', () => {
    it('should format new varsler when there is one unread sykmelding', () => {
        render(
            <SykmeldtCard
                sykmeldt={createPreviewSykmeldt({
                    previewSykmeldinger: [createPreviewSykmelding({ lest: false })],
                })}
                notification
            />,
        );

        expect(screen.getByText('1 ny varsel')).toBeInTheDocument();
    });

    it('should format new varsler when there is multiple unread', () => {
        render(
            <SykmeldtCard
                sykmeldt={createPreviewSykmeldt({
                    previewSykmeldinger: [createPreviewSykmelding({ lest: false })],
                    previewSoknader: [createPreviewSoknad({ lest: false })],
                })}
                notification
            />,
        );

        expect(screen.getByText('2 nye varsler')).toBeInTheDocument();
    });

    describe('given no new varslinger', () => {
        xit('should format periode text', () => {
            // TODO ref. TODO in Sykmeldte.card.tsx:47
        });
    });
});

import { createPreviewSendtSoknad, createSykmelding, createPreviewSykmeldt } from '../../../../utils/test/dataCreators';
import { render, screen } from '../../../../utils/test/testUtils';

import SykmeldtSummary from './SykmeldtSummary';

describe('SykmeldtCard', () => {
    it('should format new varsler when there is one unread sykmelding', () => {
        render(
            <SykmeldtSummary
                sykmeldt={createPreviewSykmeldt({
                    sykmeldinger: [createSykmelding({ lest: false })],
                })}
                notification
            />,
        );

        expect(screen.getByText('1 nytt varsel')).toBeInTheDocument();
    });

    it('should format new varsler when there is multiple unread', () => {
        render(
            <SykmeldtSummary
                sykmeldt={createPreviewSykmeldt({
                    sykmeldinger: [createSykmelding({ lest: false })],
                    previewSoknader: [createPreviewSendtSoknad({ lest: false })],
                })}
                notification
            />,
        );

        expect(screen.getByText('2 nye varsler')).toBeInTheDocument();
    });
});

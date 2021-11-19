import { createPreviewSoknad } from '../../../../utils/test/dataCreators';
import { render, screen } from '../../../../utils/test/testUtils';

import SoknaderLink from './SoknaderLink';

describe('SoknaderLink', () => {
    it('should link to soknader when there are no unread items', () => {
        const soknader = [createPreviewSoknad({ lest: true })];

        render(<SoknaderLink sykmeldtId="test-id" soknader={soknader} />);

        expect(screen.getByRole('link')).toHaveAttribute('href', '/sykmeldt/test-id/soknader');
    });

    it('should link directly to soknad if only one unread', () => {
        const soknader = [
            createPreviewSoknad({ id: 'soknad-1', lest: false }),
            createPreviewSoknad({ id: 'soknad-2', lest: true }),
            createPreviewSoknad({ id: 'soknad-3', lest: true }),
        ];

        render(<SoknaderLink sykmeldtId="test-id" soknader={soknader} />);

        expect(screen.getByRole('link')).toHaveAttribute('href', '/sykmeldt/test-id/soknad/soknad-1');
    });

    it('should link to soknader when there are multiple unread', () => {
        const soknader = [
            createPreviewSoknad({ id: 'soknad-1', lest: false }),
            createPreviewSoknad({ id: 'soknad-2', lest: false }),
            createPreviewSoknad({ id: 'soknad-3', lest: true }),
        ];

        render(<SoknaderLink sykmeldtId="test-id" soknader={soknader} />);

        expect(screen.getByRole('link')).toHaveAttribute('href', '/sykmeldt/test-id/soknader');
    });
});

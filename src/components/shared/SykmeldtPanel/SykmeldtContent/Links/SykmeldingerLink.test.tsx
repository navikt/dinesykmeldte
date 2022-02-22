import { createPreviewSykmelding } from '../../../../../utils/test/dataCreators';
import { render, screen } from '../../../../../utils/test/testUtils';

import SykmeldingerLink from './SykmeldingerLink';

describe('SykmeldingerLink', () => {
    it('should link to sykmeldinger when there are no unread items', () => {
        const sykmeldinger = [createPreviewSykmelding({ lest: true })];

        render(<SykmeldingerLink sykmeldtId="test-id" sykmeldinger={sykmeldinger} />);

        expect(screen.getByRole('link')).toHaveAttribute('href', '/sykmeldt/test-id/sykmeldinger');
    });

    it('should link directly to sykmelding if only one unread', () => {
        const sykmeldinger = [
            createPreviewSykmelding({ id: 'sykmelding-1', lest: false }),
            createPreviewSykmelding({ id: 'sykmelding-2', lest: true }),
            createPreviewSykmelding({ id: 'sykmelding-3', lest: true }),
        ];

        render(<SykmeldingerLink sykmeldtId="test-id" sykmeldinger={sykmeldinger} />);

        expect(screen.getByRole('link')).toHaveAttribute('href', '/sykmeldt/test-id/sykmelding/sykmelding-1');
    });

    it('should link to sykmeldinger when there are multiple unread', () => {
        const sykmeldinger = [
            createPreviewSykmelding({ id: 'sykmelding-1', lest: false }),
            createPreviewSykmelding({ id: 'sykmelding-2', lest: false }),
            createPreviewSykmelding({ id: 'sykmelding-3', lest: true }),
        ];

        render(<SykmeldingerLink sykmeldtId="test-id" sykmeldinger={sykmeldinger} />);

        expect(screen.getByRole('link')).toHaveAttribute('href', '/sykmeldt/test-id/sykmeldinger');
    });
});

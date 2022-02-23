import { createHendelse } from '../../../../../utils/test/dataCreators';
import { render, screen } from '../../../../../utils/test/testUtils';
import { HendelseFragment } from '../../../../../graphql/queries/react-query.generated';

import HendelserLink from './HendelserLink';

describe('HendelserLink', () => {
    it('should link to redirect without IDs if no hendelser', () => {
        const hendelser: HendelseFragment[] = [];

        render(<HendelserLink sykmeldtId="test-id" hendelser={hendelser} />);

        expect(screen.getByRole('link')).toHaveAttribute('href', '/dialogmoter/test-id');
    });

    it('should link to redirect with IDs and list tekst', () => {
        const hendelser = [
            createHendelse({ id: 'hendelse-1', tekst: 'Hendelse 1 tekst veldig bra' }),
            createHendelse({ id: 'hendelse-2', tekst: 'Hendelse 2 tekst noko anna' }),
        ];

        render(<HendelserLink sykmeldtId="test-id" hendelser={hendelser} />);
        const listItems = screen.getAllByRole('listitem');

        expect(screen.getByRole('link')).toHaveAttribute(
            'href',
            '/dialogmoter/test-id?hendelser=hendelse-1&hendelser=hendelse-2',
        );
        expect(listItems[0]).toHaveTextContent('Hendelse 1 tekst veldig bra');
        expect(listItems[1]).toHaveTextContent('Hendelse 2 tekst noko anna');
    });
});

import { render, screen } from '../../utils/test/testUtils';
import { createInitialQuery, createSoknad, createSykmelding } from '../../utils/test/dataCreators';
import { SykmeldingByIdDocument } from '../../graphql/queries/graphql.generated';

import SoknadPanel from './SoknadPanel';

const initialState = [
    createInitialQuery(SykmeldingByIdDocument, { sykmelding: createSykmelding({ id: 'default-sykmelding-1' }) }),
];

describe('SoknadPanel', () => {
    it('should show information about Soknad', async () => {
        render(<SoknadPanel soknad={createSoknad()} />, { initialState });

        expect(screen.getByRole('heading', { name: 'Oppsummering fra søknaden' })).toBeInTheDocument();
        expect(screen.getByRole('listitem', { name: 'Søknaden er sendt inn av' })).toHaveTextContent('Test person');
        expect(screen.getByRole('listitem', { name: 'Søknaden gjelder for perioden' })).toHaveTextContent(
            '1. mars 2021 - 23. juni 2021',
        );
    });
});

import { DehydratedState } from 'react-query';

import { render, screen } from '../../utils/test/testUtils';
import { createDehydratedState, createSoknad, createSykmeldingByIdPrefetchState } from '../../utils/test/dataCreators';

import SoknadPanel from './SoknadPanel';

const prefetchState: DehydratedState = createDehydratedState({
    queries: [createSykmeldingByIdPrefetchState('test-sykmelding-id')],
});

describe('SoknadPanel', () => {
    it('should show information about Soknad', async () => {
        render(<SoknadPanel soknad={createSoknad()} sykmeldingId={'test-sykmelding-id'} />, {
            state: prefetchState,
        });

        expect(screen.getByRole('heading', { name: 'Oppsummering fra søknaden' })).toBeInTheDocument();
        expect(screen.getByRole('listitem', { name: 'Søknaden er sendt inn av' })).toHaveTextContent('Test person');
        expect(screen.getByRole('listitem', { name: 'Søknaden gjelder for perioden' })).toHaveTextContent(
            '1. mars 2021 - 23. juni 2021',
        );
    });
});

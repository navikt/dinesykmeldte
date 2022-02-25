import userEvent from '@testing-library/user-event';
import { waitForElementToBeRemoved } from '@testing-library/react';

import { nock, render, screen } from '../../../../utils/test/testUtils';
import {
    createDehydratedState,
    createMineSykmeldtePrefetchState,
    createPreviewSykmeldt,
} from '../../../../utils/test/dataCreators';
import { MineSykmeldteDocument, UnlinkSykmeldtDocument } from '../../../../graphql/queries/react-query.generated';

import SykmeldtInfo from './SykmeldtInfo';

describe('SykmeldtInfo', () => {
    it('modal should open and close', () => {
        render(<SykmeldtInfo sykmeldt={createPreviewSykmeldt()} />, {
            state: createDehydratedState({ queries: [createMineSykmeldtePrefetchState()] }),
        });

        userEvent.click(screen.getByRole('button', { name: 'melde endring til NAV' }));
        expect(screen.getByRole('dialog', { name: 'Meld fra om endring' })).toBeInTheDocument();

        userEvent.click(screen.getByRole('button', { name: 'Avbryt' }));
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('should unlink the sykmeldt and refetch sykmeldte list on click', async () => {
        const sykmeldtId = 'sykme-id-1';
        const scope = nock();

        scope
            .post('/api/graphql', { query: UnlinkSykmeldtDocument, variables: { sykmeldtId: sykmeldtId } })
            .once()
            .reply(200, { data: [] });
        scope.post('/api/graphql', { query: MineSykmeldteDocument }).once().reply(200, { data: [] });

        render(<SykmeldtInfo sykmeldt={createPreviewSykmeldt({ narmestelederId: sykmeldtId })} />, {
            state: createDehydratedState({ queries: [createMineSykmeldtePrefetchState()] }),
        });

        userEvent.click(screen.getByRole('button', { name: 'melde endring til NAV' }));
        userEvent.click(screen.getByRole('button', { name: 'Ja, fjern fra min oversikt' }));

        await waitForElementToBeRemoved(() => screen.queryByRole('dialog', { name: 'Meld fra om endring' }));
        await expect(scope).toHaveNoMoreMocks();
    });
});

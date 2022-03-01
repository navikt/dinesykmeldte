import userEvent from '@testing-library/user-event';
import { waitForElementToBeRemoved } from '@testing-library/react';

import { render, screen } from '../../../../utils/test/testUtils';
import { createInitialQuery, createMock, createPreviewSykmeldt } from '../../../../utils/test/dataCreators';
import { MineSykmeldteDocument, UnlinkSykmeldtDocument } from '../../../../graphql/queries/graphql.generated';

import SykmeldtInfo from './SykmeldtInfo';

describe('SykmeldtInfo', () => {
    it('modal should open and close', () => {
        render(<SykmeldtInfo sykmeldt={createPreviewSykmeldt()} />, {
            initialState: [createInitialQuery(MineSykmeldteDocument, { mineSykmeldte: [createPreviewSykmeldt()] })],
        });

        userEvent.click(screen.getByRole('button', { name: 'melde endring til NAV' }));
        expect(screen.getByRole('dialog', { name: 'Meld fra om endring' })).toBeInTheDocument();

        userEvent.click(screen.getByRole('button', { name: 'Avbryt' }));
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('should unlink the sykmeldt and refetch sykmeldte list on click', async () => {
        const sykmeldtId = 'sykme-id-1';
        const unlinkDone = jest.fn();
        const refetchComplete = jest.fn();

        const mockUnlink = createMock({
            request: { query: UnlinkSykmeldtDocument, variables: { sykmeldtId } },
            result: () => {
                unlinkDone();
                return { data: { unlinkSykmeldt: true } };
            },
        });
        const mockRefetchMineSykmeldte = createMock({
            request: { query: MineSykmeldteDocument },
            result: () => {
                refetchComplete();
                return { data: { mineSykmeldte: [] } };
            },
        });

        render(<SykmeldtInfo sykmeldt={createPreviewSykmeldt({ narmestelederId: sykmeldtId })} />, {
            initialState: [createInitialQuery(MineSykmeldteDocument, { mineSykmeldte: [createPreviewSykmeldt()] })],
            mocks: [mockUnlink, mockRefetchMineSykmeldte],
        });

        userEvent.click(screen.getByRole('button', { name: 'melde endring til NAV' }));
        userEvent.click(screen.getByRole('button', { name: 'Ja, fjern fra min oversikt' }));

        await waitForElementToBeRemoved(() => screen.queryByRole('dialog', { name: 'Meld fra om endring' }));
        expect(unlinkDone).toHaveBeenCalled();
        expect(refetchComplete).toHaveBeenCalled();
    });
});

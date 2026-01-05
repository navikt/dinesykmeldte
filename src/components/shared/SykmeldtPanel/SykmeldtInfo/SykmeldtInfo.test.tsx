import { describe, it, expect, vi } from 'vitest'
import userEvent from '@testing-library/user-event'
import type { FetchResult } from '@apollo/client/link/core'

import { render, screen, waitFor } from '../../../../utils/test/testUtils'
import { createInitialQuery, createMock, createPreviewSykmeldt } from '../../../../utils/test/dataCreators'
import {
    MineSykmeldteDocument,
    UnlinkSykmeldtDocument,
    type MineSykmeldteQuery,
    type UnlinkSykmeldtMutation,
} from '../../../../graphql/queries/graphql.generated'

import SykmeldtInfo from './SykmeldtInfo'

describe('SykmeldtInfo', () => {
    it('modal should open and close', async () => {
        render(<SykmeldtInfo sykmeldt={createPreviewSykmeldt()} />, {
            initialState: [
                createInitialQuery(MineSykmeldteDocument, {
                    __typename: 'Query',
                    mineSykmeldte: [createPreviewSykmeldt()],
                }),
            ],
        })

        await userEvent.click(screen.getByRole('button', { name: 'Fjern fra min oversikt' }))
        expect(screen.getByRole('dialog', { name: 'Meld fra om endring' })).toBeInTheDocument()

        await userEvent.click(screen.getByRole('button', { name: 'Avbryt' }))
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    it('should unlink the sykmeldt and refetch sykmeldte list on click', async () => {
        const sykmeldtId = 'sykme-id-1'
        const unlinkDone = vi.fn()
        const refetchComplete = vi.fn()

        const mockUnlink = createMock({
            request: { query: UnlinkSykmeldtDocument, variables: { sykmeldtId } },
            result: () => {
                unlinkDone()
                return {
                    data: { __typename: 'Mutation' as const, unlinkSykmeldt: true },
                } satisfies FetchResult<UnlinkSykmeldtMutation>
            },
        })
        const mockRefetchMineSykmeldte = createMock({
            request: { query: MineSykmeldteDocument },
            result: () => {
                refetchComplete()
                return {
                    data: { __typename: 'Query' as const, mineSykmeldte: [] },
                } satisfies FetchResult<MineSykmeldteQuery>
            },
        })

        render(<SykmeldtInfo sykmeldt={createPreviewSykmeldt({ narmestelederId: sykmeldtId })} />, {
            initialState: [
                createInitialQuery(MineSykmeldteDocument, {
                    __typename: 'Query',
                    mineSykmeldte: [createPreviewSykmeldt()],
                }),
            ],
            mocks: [mockUnlink, mockRefetchMineSykmeldte],
        })

        await userEvent.click(screen.getByRole('button', { name: 'Fjern fra min oversikt' }))
        await userEvent.click(screen.getByRole('button', { name: 'Ja, fjern fra min oversikt' }))

        expect(unlinkDone).toHaveBeenCalled()
        expect(refetchComplete).toHaveBeenCalled()
        await waitFor(() =>
            expect(screen.queryByRole('dialog', { name: 'Meld fra om endring' })).not.toBeInTheDocument(),
        )
    })
})

import { vi, describe, it, expect, Mock } from 'vitest'
import mockRouter from 'next-router-mock'
import * as dekoratoren from '@navikt/nav-dekoratoren-moduler'
import { MockedResponse } from '@apollo/client/testing'
import { waitFor } from '@testing-library/react'
import type { FetchResult } from '@apollo/client/link/core'

import { render } from '../../../../utils/test/testUtils'
import {
    MarkSykmeldingReadDocument,
    MineSykmeldteDocument,
    SykmeldingByIdDocument,
    VirksomheterDocument,
    type MarkSykmeldingReadMutation,
    type MineSykmeldteQuery,
} from '../../../../graphql/queries/graphql.generated'
import { overrideWindowLocation } from '../../../../utils/test/locationUtils'
import {
    createInitialQuery,
    createMock,
    createPreviewSykmeldt,
    createSykmelding,
    createVirksomhet,
} from '../../../../utils/test/dataCreators'

import Sykmelding from './[sykmeldingId].page'

vi.mock('@navikt/nav-dekoratoren-moduler', async (importOriginal) => {
    const actual: { default: typeof dekoratoren } = await importOriginal()

    return actual.default
})

const sykmeldt = createPreviewSykmeldt({
    fnr: '12r398123012',
    navn: 'Liten Kopp',
    orgnummer: '896929119',
    narmestelederId: 'test-sykmeldt-id',
    sykmeldinger: [createSykmelding()],
})

const initialState = [
    createInitialQuery(VirksomheterDocument, {
        __typename: 'Query',
        virksomheter: [createVirksomhet({ orgnummer: '896929119' })],
    }),
    createInitialQuery(MineSykmeldteDocument, {
        __typename: 'Query',
        mineSykmeldte: [sykmeldt],
    }),
    createInitialQuery(
        SykmeldingByIdDocument,
        { __typename: 'Query', sykmelding: createSykmelding({ id: 'test-sykmelding-id' }) },
        { sykmeldingId: 'test-sykmelding-id' },
    ),
]

describe('Sykmelding page', () => {
    const currentUrl = '/sykmeldt/test-sykmeldt-id/sykmelding/test-sykmelding-id'

    mockRouter.setCurrentUrl(currentUrl)
    overrideWindowLocation(currentUrl)

    describe('on initial load', () => {
        it('should mark sykmelding as read on load', async () => {
            const readComplete = vi.fn()

            render(<Sykmelding />, {
                initialState,
                mocks: [
                    markReadMock(readComplete),
                    // Query is refetched after søknad is marked as read
                    createMock({
                        request: { query: MineSykmeldteDocument },
                        result: {
                            data: { __typename: 'Query', mineSykmeldte: [sykmeldt] },
                        } satisfies FetchResult<MineSykmeldteQuery>,
                    }),
                ],
            })

            await waitFor(() => expect(readComplete).toHaveBeenCalled())
        })

        it('should set the correct breadcrumbs', async () => {
            const readComplete = vi.fn()
            const spy = vi.spyOn(dekoratoren, 'setBreadcrumbs')

            render(<Sykmelding />, {
                initialState,
                mocks: [
                    markReadMock(readComplete),
                    // Query is refetched after søknad is marked as read
                    createMock({
                        request: { query: MineSykmeldteDocument },
                        result: {
                            data: { __typename: 'Query', mineSykmeldte: [sykmeldt] },
                        } satisfies FetchResult<MineSykmeldteQuery>,
                    }),
                ],
            })

            await waitFor(() => expect(readComplete).toHaveBeenCalled())

            expect(spy).toHaveBeenCalledWith([
                { handleInApp: true, title: 'Dine sykmeldte', url: '/fake/basepath' },
                {
                    handleInApp: true,
                    title: 'Liten Kopps sykmeldinger',
                    url: '/fake/basepath/sykmeldt/test-sykmeldt-id/sykmeldinger',
                    analyticsTitle: 'Den sykmeldtes sykmeldinger',
                },
                { handleInApp: true, title: 'Sykmelding', url: '/' },
            ])
        })
    })
})

function markReadMock(readComplete: Mock): MockedResponse {
    return createMock({
        request: { query: MarkSykmeldingReadDocument, variables: { sykmeldingId: 'test-sykmelding-id' } },
        result: () => {
            readComplete()
            return {
                data: { __typename: 'Mutation' as const, read: true },
            } satisfies FetchResult<MarkSykmeldingReadMutation>
        },
    })
}

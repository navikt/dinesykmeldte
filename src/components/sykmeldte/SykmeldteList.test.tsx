import { describe, it, expect, Mock, beforeEach, vi } from 'vitest'
import userEvent from '@testing-library/user-event'
import { waitFor, waitForElementToBeRemoved, within } from '@testing-library/react'
import { Cache } from '@apollo/client'
import { MockedResponse } from '@apollo/client/testing'
import mockRouter from 'next-router-mock'

import { render, screen } from '../../utils/test/testUtils'
import {
    MarkAllSykmeldingerAndSoknaderAsReadDocument,
    MineSykmeldteDocument,
    PreviewSykmeldtFragment,
    VirksomheterDocument,
} from '../../graphql/queries/graphql.generated'
import {
    createInitialQuery,
    createMock,
    createSykmelding,
    createPreviewSykmeldt,
    createVirksomhet,
    createPreviewNySoknad,
    createPreviewFremtidigSoknad,
} from '../../utils/test/dataCreators'

import SykmeldteList from './SykmeldteList'

describe('SykmeldteList', () => {
    beforeEach(() => {
        mockRouter.setCurrentUrl('/sykmeldt/null')
    })

    function setup(
        initialState: Cache.WriteQueryOptions<unknown, unknown>[] = [
            createInitialQuery(VirksomheterDocument, { __typename: 'Query', virksomheter: [createVirksomhet()] }),
        ],
        mocks: MockedResponse[] = [],
    ): void {
        render(<SykmeldteList />, {
            initialState,
            mocks,
        })
    }

    it('should show loading spinner', async () => {
        const mockMineSykmeldte = createMock({
            request: { query: MineSykmeldteDocument },
            result: { data: { __typename: 'Query', mineSykmeldte: [] } },
        })

        setup(undefined, [mockMineSykmeldte])

        expect(screen.getByTitle('Laster dine ansatte')).toBeInTheDocument()
        await waitForElementToBeRemoved(() => screen.queryByTitle('Laster dine ansatte'))
    })

    it('should show error when unable to fetch', async () => {
        const mockMineSykmeldte = createMock({
            request: { query: MineSykmeldteDocument },
            error: new Error('Something went wrong'),
        })

        setup(undefined, [mockMineSykmeldte])

        expect(await screen.findByText('Klarte ikke å hente dine sykmeldte')).toBeInTheDocument()
    })

    it('should list sykmeldte on successful fetch', async () => {
        const mockMineSykmeldte = createMock({
            request: { query: MineSykmeldteDocument },
            result: {
                data: {
                    __typename: 'Query',
                    mineSykmeldte: [
                        createPreviewSykmeldt({ navn: 'Kari Normann', fnr: '1' }),
                        createPreviewSykmeldt({ navn: 'Ola Normann', fnr: '2' }),
                    ],
                },
            },
        })

        setup(undefined, [mockMineSykmeldte])

        expect(await screen.findByRole('heading', { name: 'Kari Normann' })).toBeInTheDocument()
        expect(await screen.findByRole('heading', { name: 'Ola Normann' })).toBeInTheDocument()
    })

    it('should expand and close the panel when clicked', async () => {
        setup([
            createInitialQuery(VirksomheterDocument, { __typename: 'Query', virksomheter: [createVirksomhet()] }),
            createInitialQuery(MineSykmeldteDocument, {
                __typename: 'Query',
                mineSykmeldte: [createPreviewSykmeldt()],
            }),
        ])

        await userEvent.click(
            within(screen.getByRole('region', { name: /Ola Normann/ })).getByRole('button', { name: 'Vis mer' }),
        )

        expect(screen.getByRole('link', { name: /Sykmeldinger/ })).toBeInTheDocument()
        expect(screen.getByRole('link', { name: /Søknader/ })).toBeInTheDocument()
        expect(screen.getByRole('link', { name: /Dialogmøter/ })).toBeInTheDocument()

        await userEvent.click(
            within(screen.getByRole('region', { name: /Ola Normann/ })).getAllByRole('button', { name: 'Vis mer' })[0],
        )

        expect(screen.queryByRole('link', { name: /Sykmeldinger/ })).not.toBeInTheDocument()
        expect(screen.queryByRole('link', { name: /Søknader/ })).not.toBeInTheDocument()
        expect(screen.queryByRole('link', { name: /Dialogmøter/ })).not.toBeInTheDocument()
    })

    it('should expand sykmelding periode summary and show content', async () => {
        setup([
            createInitialQuery(VirksomheterDocument, { __typename: 'Query', virksomheter: [createVirksomhet()] }),
            createInitialQuery(MineSykmeldteDocument, {
                __typename: 'Query',
                mineSykmeldte: [createPreviewSykmeldt()],
            }),
        ])

        await userEvent.click(
            within(screen.getByRole('region', { name: /Ola Normann/ })).getByRole('button', { name: 'Vis mer' }),
        )
        await userEvent.click(
            within(screen.getByRole('region', { name: /Olas sykmeldingshistorikk/ })).getByRole('button', {
                name: 'Vis mer',
            }),
        )

        const table = within(screen.getByRole('table'))
        const cells = table.getAllByRole('cell')

        expect(cells[0]).toHaveTextContent('8. - 15. august 2021')
        expect(cells[1]).toHaveTextContent('100%')
        expect(cells[2]).toHaveTextContent('Ferdig')
    })

    it('should filter by the active virksomhet', async () => {
        setup([
            createInitialQuery(VirksomheterDocument, {
                __typename: 'Query',
                virksomheter: [
                    createVirksomhet({ navn: 'Org 1', orgnummer: 'org-1' }),
                    createVirksomhet({ navn: 'Org 2', orgnummer: 'org-2' }),
                ],
            }),
            createInitialQuery(MineSykmeldteDocument, {
                __typename: 'Query',
                mineSykmeldte: [
                    createPreviewSykmeldt({ fnr: '1', navn: 'Mr. Show', orgnummer: 'org-1' }),
                    createPreviewSykmeldt({ fnr: '2', navn: 'Ms. Hide', orgnummer: 'org-2' }),
                ],
            }),
        ])

        await userEvent.selectOptions(screen.getByRole('combobox', { name: 'Velg virksomhet' }), 'Org 1')

        expect(screen.getByRole('heading', { name: 'Mr. Show' })).toBeInTheDocument()
        expect(screen.queryByRole('heading', { name: 'Ms. Hide' })).not.toBeInTheDocument()
    })

    it('should group sykmeldte by notifying status', async () => {
        const sykmeldte: PreviewSykmeldtFragment[] = [
            createPreviewSykmeldt({
                fnr: '1',
                navn: 'Mr. Notifying',
                sykmeldinger: [createSykmelding({ id: 'sykme-1', lest: false })],
            }),
            createPreviewSykmeldt({
                fnr: '2',
                navn: 'Ms. Read',
                sykmeldinger: [createSykmelding({ id: 'sykme-2', lest: true })],
            }),
        ]
        setup([
            createInitialQuery(VirksomheterDocument, { __typename: 'Query', virksomheter: [createVirksomhet()] }),
            createInitialQuery(MineSykmeldteDocument, { __typename: 'Query', mineSykmeldte: sykmeldte }),
        ])

        const notifyingSection = within(screen.getByRole('region', { name: 'Varslinger' }))
        expect(notifyingSection.getAllByRole('button')).toHaveLength(2)
        expect(notifyingSection.getByRole('button', { name: /Merk varsler som lest/ })).toBeInTheDocument()
        await userEvent.click(
            within(screen.getByRole('region', { name: /Mr. Notifying/ })).getByRole('button', { name: 'Vis mer' }),
        )

        const nonNotifyingSection = within(screen.getByRole('region', { name: 'Sykmeldte uten varsel' }))
        expect(nonNotifyingSection.getAllByRole('button')).toHaveLength(1)
        expect(nonNotifyingSection.getByRole('region', { name: /Ms. Read/ })).toBeInTheDocument()
    })

    it('should automatically expand focused sykmeldt based on URL', async () => {
        mockRouter.setCurrentUrl('/sykmeldt/focus-id')

        const sykmeldte: PreviewSykmeldtFragment[] = [
            createPreviewSykmeldt({
                fnr: '1',
                navn: 'Not focused',
                narmestelederId: '837b4594-1903-406b-9b10-96ff6673f021',
                sykmeldinger: [createSykmelding({ id: 'sykme-1', lest: true })],
            }),
            createPreviewSykmeldt({
                fnr: '2',
                navn: 'F. Ocused',
                narmestelederId: 'focus-id',
                sykmeldinger: [createSykmelding({ id: 'sykme-2', lest: true })],
            }),
        ]
        setup([
            createInitialQuery(VirksomheterDocument, { __typename: 'Query', virksomheter: [createVirksomhet()] }),
            createInitialQuery(MineSykmeldteDocument, { __typename: 'Query', mineSykmeldte: sykmeldte }),
        ])

        const nonNotifyingSection = within(screen.getByRole('region', { name: 'Sykmeldte uten varsel' }))
        expect(
            within(await nonNotifyingSection.findByRole('region', { name: /Not focused/ })).getByRole('button', {
                name: 'Vis mer',
            }),
        ).toHaveAttribute('aria-expanded', 'false')
        expect(
            within(await nonNotifyingSection.findByRole('region', { name: /F. Ocused/ })).getAllByRole('button', {
                name: 'Vis mer',
            })[0],
        ).toHaveAttribute('aria-expanded', 'true')
    })

    it('should automatically set URL to root when closing focused sykmeldt', async () => {
        mockRouter.setCurrentUrl('/sykmeldt/focus-id')

        const sykmeldte: PreviewSykmeldtFragment[] = [
            createPreviewSykmeldt({
                fnr: '1',
                navn: 'Not focused',
                narmestelederId: '837b4594-1903-406b-9b10-96ff6673f021',
                sykmeldinger: [createSykmelding({ id: 'sykme-1', lest: true })],
            }),
            createPreviewSykmeldt({
                fnr: '2',
                navn: 'F. Ocused',
                narmestelederId: 'focus-id',
                sykmeldinger: [createSykmelding({ id: 'sykme-2', lest: true })],
            }),
        ]
        setup([
            createInitialQuery(VirksomheterDocument, { __typename: 'Query', virksomheter: [createVirksomhet()] }),
            createInitialQuery(MineSykmeldteDocument, { __typename: 'Query', mineSykmeldte: sykmeldte }),
        ])

        const nonNotifyingSection = within(screen.getByRole('region', { name: 'Sykmeldte uten varsel' }))
        await userEvent.click(
            within(nonNotifyingSection.getByRole('region', { name: /F. Ocused/ })).getAllByRole('button', {
                name: 'Vis mer',
            })[0],
        )
        expect(
            within(await nonNotifyingSection.findByRole('region', { name: /F. Ocused/ })).getByRole('button', {
                name: 'Vis mer',
            }),
        ).toHaveAttribute('aria-expanded', 'false')
    })

    // TODO: Can be removed is is made non-nullable and sortByNotifying.ts:42 is fixed
    it('should notify user when sykmelding is unread AND missing sendtTilArbeidsgiverDato', () => {
        const sykmeldte: PreviewSykmeldtFragment[] = [
            createPreviewSykmeldt({
                fnr: '1',
                navn: 'Buggy Mann',
                sykmeldinger: [createSykmelding({ id: 'sykme-1', lest: false, sendtTilArbeidsgiverDato: null })],
                previewSoknader: [createPreviewFremtidigSoknad({ id: 'soknad-1' })],
            }),
        ]

        setup([
            createInitialQuery(VirksomheterDocument, { __typename: 'Query', virksomheter: [createVirksomhet()] }),
            createInitialQuery(MineSykmeldteDocument, { __typename: 'Query', mineSykmeldte: sykmeldte }),
        ])

        const notifyingSection = within(screen.getByRole('region', { name: 'Varslinger' }))
        expect(notifyingSection.getAllByRole('button')).toHaveLength(2)
        expect(notifyingSection.getByRole('button', { name: /Merk varsler som lest/ })).toBeInTheDocument()
        expect(notifyingSection.getByRole('region', { name: /Buggy Mann/ })).toBeInTheDocument()
    })

    it('should mark all sykmeldinger and soknader as read', async () => {
        const sykmeldte: PreviewSykmeldtFragment[] = [
            createPreviewSykmeldt({
                fnr: '1',
                navn: 'Ola Nordmann',
                narmestelederId: 'ola-id',
                sykmeldinger: [createSykmelding({ id: 'sykme-1', lest: false })],
            }),
            createPreviewSykmeldt({
                fnr: '2',
                navn: 'Kari Nordmann',
                narmestelederId: 'kari-id',
                sykmeldinger: [createSykmelding({ id: 'sykme-2', lest: true })],
                previewSoknader: [
                    createPreviewNySoknad({
                        id: 'soknad-1',
                        lest: false,
                        ikkeSendtSoknadVarsel: true,
                        ikkeSendtSoknadVarsletDato: '2022-10-02',
                    }),
                ],
            }),
        ]
        const readComplete = vi.fn()
        const refetchComplete = vi.fn()
        setup(
            [
                createInitialQuery(VirksomheterDocument, { __typename: 'Query', virksomheter: [createVirksomhet()] }),
                createInitialQuery(MineSykmeldteDocument, { __typename: 'Query', mineSykmeldte: sykmeldte }),
            ],
            [
                markAllAsReadMock(readComplete),
                refetchCompleteMock(sykmeldte, refetchComplete),
                // When modal is opened, the data is refetched, so for now we'll have a bonus refetch mock
                refetchCompleteMock(sykmeldte, refetchComplete),
            ],
        )

        const notifyingSection = within(screen.getByRole('region', { name: 'Varslinger' }))
        expect(
            screen.queryByRole('dialog', { name: 'Du er på vei til å merke varsler som lest' }),
        ).not.toBeInTheDocument()

        expect(notifyingSection.getByText('Ulest sykmelding')).toBeInTheDocument()
        expect(notifyingSection.getByText('Mangler søknad')).toBeInTheDocument()

        await userEvent.click(notifyingSection.getByRole('button', { name: 'Merk varsler som lest' }))
        expect(screen.getByRole('dialog', { name: 'Du er på vei til å merke varsler som lest' })).toBeInTheDocument()

        await userEvent.click(screen.getByRole('button', { name: 'Ok, merk som lest!' }))
        await waitFor(() => expect(readComplete).toHaveBeenCalled())
        await waitFor(() => expect(refetchComplete).toHaveBeenCalled())
    })
})

function markAllAsReadMock(readComplete: Mock): MockedResponse {
    return createMock({
        request: { query: MarkAllSykmeldingerAndSoknaderAsReadDocument },
        result: () => {
            readComplete()
            return {
                data: { __typename: 'Mutation' as const, markAllSykmeldingerAndSoknaderAsRead: true },
            }
        },
    })
}

function refetchCompleteMock(mineSykmeldte: PreviewSykmeldtFragment[], refetchComplete: Mock): MockedResponse {
    return createMock({
        request: { query: MineSykmeldteDocument },
        result: () => {
            refetchComplete()
            return { data: { __typename: 'Query' as const, mineSykmeldte } }
        },
    })
}

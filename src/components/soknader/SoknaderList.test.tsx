import { MockedResponse } from '@apollo/client/testing'

import {
    MarkSoknadReadDocument,
    MineSykmeldteDocument,
    PreviewSykmeldtFragment,
} from '../../graphql/queries/graphql.generated'
import {
    createInitialQuery,
    createMock,
    createPreviewFremtidigSoknad,
    createPreviewNySoknad,
    createPreviewSendtSoknad,
    createPreviewSykmeldt,
} from '../../utils/test/dataCreators'
import { render, screen, waitFor, within } from '../../utils/test/testUtils'

import SoknaderList from './SoknaderList'

describe('SoknaderList', () => {
    function setup(sykmeldt: PreviewSykmeldtFragment, mocks?: MockedResponse[]): void {
        render(<SoknaderList sykmeldtId="test-sykmeldt-id" sykmeldt={sykmeldt} />, {
            initialState: [
                createInitialQuery(MineSykmeldteDocument, {
                    __typename: 'Query',
                    mineSykmeldte: [createPreviewSykmeldt()],
                }),
            ],
            mocks,
        })
    }

    it('should render søknader in sections according to status', () => {
        render(
            <SoknaderList
                sykmeldtId="test-id"
                sykmeldt={createPreviewSykmeldt({
                    previewSoknader: [
                        createPreviewFremtidigSoknad({ id: 'soknad-1' }),
                        createPreviewNySoknad({ id: 'soknad-2' }),
                        createPreviewSendtSoknad({ id: 'soknad-4', lest: false }),
                        createPreviewSendtSoknad({ id: 'soknad-4', lest: true }),
                    ],
                })}
            />,
        )

        const fremtidigSection = within(screen.getByRole('region', { name: 'Planlagte søknader' }))
        expect(fremtidigSection.getAllByRole('button', { name: /Søknad/ })).toHaveLength(1)

        const nySection = within(screen.getByRole('region', { name: 'Til utfylling' }))
        expect(nySection.getAllByRole('button', { name: /Søknad/ })).toHaveLength(1)

        const ulestSection = within(screen.getByRole('region', { name: 'Uleste søknader' }))
        expect(ulestSection.getAllByRole('link', { name: /Søknad/ })).toHaveLength(1)

        const lestSection = within(screen.getByRole('region', { name: 'Leste søknader' }))
        expect(lestSection.getAllByRole('link', { name: /Søknad/ })).toHaveLength(1)
    })

    it('should link to the correct path', () => {
        render(
            <SoknaderList
                sykmeldtId="test-id"
                sykmeldt={createPreviewSykmeldt({
                    previewSoknader: [createPreviewSendtSoknad({ id: 'soknad-1' })],
                })}
            />,
        )

        expect(screen.getByRole('link', { name: /Søknad/ })).toHaveAttribute(
            'href',
            '/sykmeldt/test-id/soknad/soknad-1',
        )
    })

    it('should render in order of date, newest first', () => {
        render(
            <SoknaderList
                sykmeldtId="test-id"
                sykmeldt={createPreviewSykmeldt({
                    previewSoknader: [
                        createPreviewSendtSoknad({ id: 'soknad-1', lest: true, fom: '2021-01-01', tom: '2021-01-05' }),
                        createPreviewSendtSoknad({ id: 'soknad-2', lest: true, fom: '2020-01-01', tom: '2020-01-05' }),
                        createPreviewSendtSoknad({ id: 'soknad-3', lest: true, fom: '2023-01-01', tom: '2023-01-05' }),
                        createPreviewSendtSoknad({ id: 'soknad-4', lest: true, fom: '2022-01-01', tom: '2022-01-05' }),
                    ],
                })}
            />,
        )

        const lestSection = within(screen.getByRole('region', { name: 'Leste søknader' }))
        const links = lestSection.getAllByRole('link', { name: /Søknad/ })

        expect(links).toHaveLength(4)
        expect(links[0]).toHaveTextContent('1. januar 2023 - 5. januar 2023')
        expect(links[1]).toHaveTextContent('1. januar 2022 - 5. januar 2022')
        expect(links[2]).toHaveTextContent('1. januar 2021 - 5. januar 2021')
        expect(links[3]).toHaveTextContent('1. januar 2020 - 5. januar 2020')
    })

    it('should mark one PreviewNySoknad with warning as read', async () => {
        const readComplete = jest.fn()
        const refetchComplete = jest.fn()
        const mocks = [markReadMock(readComplete, 'soknad-id'), refetchCompleteMock(refetchComplete)]

        const nySoknadUnreadWithWarning = [
            createPreviewNySoknad({
                id: 'soknad-id',
                ikkeSendtSoknadVarsel: true,
                lest: false,
            }),
        ]

        setup(createPreviewSykmeldt({ previewSoknader: nySoknadUnreadWithWarning }), mocks)

        await waitFor(() => expect(readComplete).toHaveBeenCalledTimes(1))
        await waitFor(() => expect(refetchComplete).toHaveBeenCalled())
    })

    it('should mark two PreviewNySoknad with warning as read', async () => {
        const readComplete = jest.fn()
        const refetchComplete = jest.fn()
        const mocks = [
            markReadMock(readComplete, 'soknad-id-1'),
            markReadMock(readComplete, 'soknad-id-2'),
            refetchCompleteMock(refetchComplete),
        ]

        const nySoknadUnreadWithWarning = [
            createPreviewNySoknad({
                id: 'soknad-id-1',
                ikkeSendtSoknadVarsel: true,
                lest: false,
            }),
            createPreviewNySoknad({
                id: 'soknad-id-2',
                ikkeSendtSoknadVarsel: true,
                lest: false,
            }),
        ]

        setup(createPreviewSykmeldt({ previewSoknader: nySoknadUnreadWithWarning }), mocks)

        await waitFor(() => expect(readComplete).toHaveBeenCalledTimes(2))
        await waitFor(() => expect(refetchComplete).toHaveBeenCalled())
    })
})

function markReadMock(readComplete: jest.Mock, soknadId: string): MockedResponse {
    return createMock({
        request: { query: MarkSoknadReadDocument, variables: { soknadId: soknadId } },
        result: () => {
            readComplete()
            return { data: { __typename: 'Mutation' as const, read: true } }
        },
    })
}

function refetchCompleteMock(refetchComplete: jest.Mock): MockedResponse {
    return createMock({
        request: { query: MineSykmeldteDocument },
        result: () => {
            refetchComplete()
            return { data: { __typename: 'Query' as const, mineSykmeldte: [] } }
        },
    })
}

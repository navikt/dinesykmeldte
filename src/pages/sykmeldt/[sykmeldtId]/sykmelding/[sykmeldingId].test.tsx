import mockRouter from 'next-router-mock'
import * as dekoratoren from '@navikt/nav-dekoratoren-moduler'
import { MockedResponse } from '@apollo/client/testing'
import { waitFor } from '@testing-library/react'

import { render } from '../../../../utils/test/testUtils'
import {
    MarkSykmeldingReadDocument,
    MineSykmeldteDocument,
    SykmeldingByIdDocument,
} from '../../../../graphql/queries/graphql.generated'
import { overrideWindowLocation } from '../../../../utils/test/locationUtils'
import {
    createInitialQuery,
    createMock,
    createPreviewSykmeldt,
    createSykmelding,
} from '../../../../utils/test/dataCreators'

import Sykmelding from './[sykmeldingId].page'

const initialState = [
    createInitialQuery(MineSykmeldteDocument, {
        __typename: 'Query',
        mineSykmeldte: [
            createPreviewSykmeldt({
                fnr: '12r398123012',
                navn: 'Liten Kopp',
                orgnummer: '896929119',
                narmestelederId: 'test-sykmeldt-id',
                sykmeldinger: [createSykmelding()],
            }),
        ],
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
            const readComplete = jest.fn()

            render(<Sykmelding />, { initialState, mocks: [markReadMock(readComplete)] })

            await waitFor(() => expect(readComplete).toHaveBeenCalled())
        })

        it('should set the correct breadcrumbs', async () => {
            const readComplete = jest.fn()
            const spy = jest.spyOn(dekoratoren, 'setBreadcrumbs')

            render(<Sykmelding />, { initialState, mocks: [markReadMock(readComplete)] })

            await waitFor(() => expect(readComplete).toHaveBeenCalled())

            expect(spy).toHaveBeenCalledWith([
                { handleInApp: true, title: 'Dine sykmeldte', url: '/fake/basepath' },
                {
                    handleInApp: true,
                    title: 'Liten Kopps sykmeldinger',
                    url: '/fake/basepath/sykmeldt/test-sykmeldt-id/sykmeldinger',
                },
                { handleInApp: true, title: 'Sykmelding', url: '/' },
            ])
        })
    })
})

function markReadMock(readComplete: jest.Mock): MockedResponse {
    return createMock({
        request: { query: MarkSykmeldingReadDocument, variables: { sykmeldingId: 'test-sykmelding-id' } },
        result: () => {
            readComplete()
            return { data: { __typename: 'Mutation' as const, read: true } }
        },
    })
}

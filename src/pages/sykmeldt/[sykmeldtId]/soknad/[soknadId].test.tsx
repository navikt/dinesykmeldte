import mockRouter from 'next-router-mock'
import * as dekoratoren from '@navikt/nav-dekoratoren-moduler'
import { waitFor } from '@testing-library/react'
import { MockedResponse } from '@apollo/client/testing'

import { render } from '../../../../utils/test/testUtils'
import {
    MarkSoknadReadDocument,
    MineSykmeldteDocument,
    SoknadByIdDocument,
    SykmeldingByIdDocument,
} from '../../../../graphql/queries/graphql.generated'
import { overrideWindowLocation } from '../../../../utils/test/locationUtils'
import {
    createInitialQuery,
    createMock,
    createPreviewSendtSoknad,
    createPreviewSykmeldt,
    createSoknad,
    createSykmelding,
} from '../../../../utils/test/dataCreators'

import Soknad from './[soknadId].page'

const initialState = [
    createInitialQuery(MineSykmeldteDocument, {
        __typename: 'Query',
        mineSykmeldte: [
            createPreviewSykmeldt({
                fnr: '12r398123012',
                navn: 'Liten Kopp',
                orgnummer: '896929119',
                narmestelederId: 'test-sykmeldt-id',
                previewSoknader: [createPreviewSendtSoknad({ id: 'test-soknad-id' })],
                sykmeldinger: [createSykmelding()],
            }),
        ],
    }),
    createInitialQuery(
        SoknadByIdDocument,
        { __typename: 'Query', soknad: createSoknad({ id: 'test-soknad-id' }) },
        { soknadId: 'test-soknad-id' },
    ),
    createInitialQuery(
        SykmeldingByIdDocument,
        { __typename: 'Query', sykmelding: createSykmelding({ id: 'default-sykmelding-1' }) },
        { sykmeldingId: 'default-sykmelding-1' },
    ),
]

describe('Søknad page', () => {
    const currentUrl = '/sykmeldt/test-sykmeldt-id/soknad/test-soknad-id'

    mockRouter.setCurrentUrl(currentUrl)
    overrideWindowLocation(currentUrl)

    it('should mark sykmelding as read on page load', async () => {
        const readComplete = jest.fn()
        render(<Soknad />, {
            initialState,
            mocks: [markReadMock(readComplete)],
        })

        await waitFor(() => expect(readComplete).toHaveBeenCalled())
    })

    it('should set the correct breadcrumbs', async () => {
        const readComplete = jest.fn()
        const spy = jest.spyOn(dekoratoren, 'setBreadcrumbs')

        render(<Soknad />, { initialState, mocks: [markReadMock(readComplete)] })

        await waitFor(() => expect(readComplete).toHaveBeenCalled())

        expect(spy).toHaveBeenCalledWith([
            { handleInApp: true, title: 'Dine sykmeldte', url: '/fake/basepath' },
            {
                handleInApp: true,
                title: 'Liten Kopps søknader',
                url: '/fake/basepath/sykmeldt/test-sykmeldt-id/soknader',
            },
            { handleInApp: true, title: 'Søknad', url: '/' },
        ])
    })
})

function markReadMock(readComplete: jest.Mock): MockedResponse {
    return createMock({
        request: { query: MarkSoknadReadDocument, variables: { soknadId: 'test-soknad-id' } },
        result: () => {
            readComplete()
            return { data: { __typename: 'Mutation' as const, read: true } }
        },
    })
}

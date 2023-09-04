import { vi, Mock, describe, it, expect } from 'vitest'
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
    VirksomheterDocument,
} from '../../../../graphql/queries/graphql.generated'
import { overrideWindowLocation } from '../../../../utils/test/locationUtils'
import {
    createInitialQuery,
    createMock,
    createPreviewSendtSoknad,
    createPreviewSykmeldt,
    createSoknad,
    createSykmelding,
    createVirksomhet,
} from '../../../../utils/test/dataCreators'

import Soknad from './[soknadId].page'

const sykmeldt = createPreviewSykmeldt({
    fnr: '12r398123012',
    navn: 'Liten Kopp',
    orgnummer: '896929119',
    narmestelederId: 'test-sykmeldt-id',
    previewSoknader: [createPreviewSendtSoknad({ id: 'test-soknad-id' })],
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

vi.mock('@navikt/nav-dekoratoren-moduler', async (importOriginal) => {
    const actual: { default: typeof dekoratoren } = await importOriginal()

    return actual.default
})

describe('Søknad page', () => {
    const currentUrl = '/sykmeldt/test-sykmeldt-id/soknad/test-soknad-id'

    mockRouter.setCurrentUrl(currentUrl)
    overrideWindowLocation(currentUrl)

    it('should mark sykmelding as read on page load', async () => {
        const readComplete = vi.fn()
        render(<Soknad />, {
            initialState,
            mocks: [
                markReadMock(readComplete),
                // Query is refetched after søknad is marked as read
                createMock({
                    request: { query: MineSykmeldteDocument },
                    result: { data: { __typename: 'Query', mineSykmeldte: [sykmeldt] } },
                }),
            ],
        })

        await waitFor(() => expect(readComplete).toHaveBeenCalled())
    })

    it('should set the correct breadcrumbs', async () => {
        const readComplete = vi.fn()
        const spy = vi.spyOn(dekoratoren, 'setBreadcrumbs')

        render(<Soknad />, {
            initialState,
            mocks: [
                markReadMock(readComplete),
                // Query is refetched after søknad is marked as read
                createMock({
                    request: { query: MineSykmeldteDocument },
                    result: { data: { __typename: 'Query', mineSykmeldte: [sykmeldt] } },
                }),
            ],
        })

        await waitFor(() => expect(readComplete).toHaveBeenCalled())

        expect(spy).toHaveBeenCalledWith([
            { handleInApp: true, title: 'Dine sykmeldte', url: '/fake/basepath' },
            {
                handleInApp: true,
                title: 'Liten Kopps søknader',
                url: '/fake/basepath/sykmeldt/test-sykmeldt-id/soknader',
                analyticsTitle: 'Den sykmeldtes søknader',
            },
            { handleInApp: true, title: 'Søknad', url: '/' },
        ])
    })
})

function markReadMock(readComplete: Mock): MockedResponse {
    return createMock({
        request: { query: MarkSoknadReadDocument, variables: { soknadId: 'test-soknad-id' } },
        result: () => {
            readComplete()
            return { data: { __typename: 'Mutation' as const, read: true } }
        },
    })
}

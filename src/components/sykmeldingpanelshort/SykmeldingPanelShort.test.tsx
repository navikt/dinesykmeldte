import { SykmeldingByIdDocument } from '../../graphql/queries/graphql.generated'
import { createInitialQuery, createSykmelding } from '../../utils/test/dataCreators'
import { render, screen, within } from '../../utils/test/testUtils'

import SykmeldingPanelShort from './SykmeldingPanelShort'

describe('SykmeldingPanelShort', () => {
    it('should show correct info', async () => {
        const sykmeldingId = 'sykmelding-1'
        render(<SykmeldingPanelShort sykmeldingId={sykmeldingId} />, {
            initialState: [
                createInitialQuery(
                    SykmeldingByIdDocument,
                    {
                        __typename: 'Query',
                        sykmelding: createSykmelding({
                            id: sykmeldingId,
                            navn: 'Test Navn',
                            arbeidsgiver: {
                                __typename: 'Arbeidsgiver',
                                navn: 'Stor bedrift',
                            },
                        }),
                    },
                    { sykmeldingId: sykmeldingId },
                ),
            ],
        })

        const infoSection = within(screen.getByRole('region', { name: 'Opplysninger fra sykmeldingen' }))
        expect(infoSection.getByRole('listitem', { name: 'Sykmeldingen gjelder' })).toHaveTextContent('Test Navn')
        expect(infoSection.getByRole('listitem', { name: 'Arbeidsgiver som legen har skrevet inn' })).toHaveTextContent(
            'Stor bedrift',
        )
    })

    it('should show utenlandsk sykmelding', async () => {
        const sykmeldingId = 'sykmelding-1'
        render(<SykmeldingPanelShort sykmeldingId={sykmeldingId} />, {
            initialState: [
                createInitialQuery(
                    SykmeldingByIdDocument,
                    {
                        __typename: 'Query',
                        sykmelding: createSykmelding({
                            id: sykmeldingId,
                            navn: 'Test Navn',
                            arbeidsgiver: {
                                __typename: 'Arbeidsgiver',
                                navn: 'Stor bedrift',
                            },
                            utenlandskSykmelding: {
                                __typename: 'UtenlandskSykmelding',
                                land: 'Polen',
                            },
                        }),
                    },
                    { sykmeldingId: sykmeldingId },
                ),
            ],
        })

        const infoSection = within(screen.getByRole('region', { name: 'Opplysninger fra utenlandsk sykmelding' }))
        expect(infoSection.getByRole('listitem', { name: 'Sykmeldingen gjelder' })).toHaveTextContent('Test Navn')
        expect(infoSection.getByRole('listitem', { name: 'Landet sykmeldingen ble skrevet' })).toHaveTextContent(
            'Polen',
        )
        expect(
            infoSection.queryByRole('listitem', { name: 'Arbeidsgiver som legen har skrevet inn' }),
        ).not.toBeInTheDocument()
    })
})

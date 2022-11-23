import mockRouter from 'next-router-mock'
import preloadAll from 'jest-next-dynamic'

import {
    createInitialQuery,
    createSykmelding,
    createPreviewSykmeldt,
    createAktivitetIkkeMuligPeriode,
} from '../../utils/test/dataCreators'
import { render, screen, within } from '../../utils/test/testUtils'
import { SykmeldingByIdDocument } from '../../graphql/queries/graphql.generated'

import SykmeldingerList from './SykmeldingerList'

describe('SykmeldingerList', () => {
    beforeEach(() => {
        preloadAll()
    })

    it('should render sykmeldinger in sections according to lest status', () => {
        mockRouter.setCurrentUrl('/sykmeldt/narmesteleder-1-08088012345/sykmeldinger')
        const sykmeldinger = [
            createSykmelding({ id: 'sykmelding-1', lest: false }),
            createSykmelding({ id: 'sykmelding-2', lest: true }),
            createSykmelding({ id: 'sykmelding-3', lest: false }),
        ]

        render(<SykmeldingerList sykmeldtId="test-id" sykmeldt={createPreviewSykmeldt({ sykmeldinger })} />, {
            initialState: sykmeldinger.map((sykmelding) =>
                createInitialQuery(
                    SykmeldingByIdDocument,
                    { __typename: 'Query', sykmelding },
                    { sykmeldingId: sykmelding.id },
                ),
            ),
        })

        const unreadSection = within(screen.getByRole('region', { name: 'Uleste' }))
        expect(unreadSection.getAllByRole('link', { name: /Sykmelding/ })).toHaveLength(2)

        const readSection = within(screen.getByRole('region', { name: 'Leste' }))
        expect(readSection.getAllByRole('link', { name: /Sykmelding/ })).toHaveLength(1)
    })

    it('should link to the correct path', () => {
        render(
            <SykmeldingerList
                sykmeldtId="test-id"
                sykmeldt={createPreviewSykmeldt({
                    sykmeldinger: [createSykmelding({ id: 'sykmelding-1' })],
                })}
            />,
            {
                initialState: [
                    createInitialQuery(
                        SykmeldingByIdDocument,
                        { __typename: 'Query', sykmelding: createSykmelding({ id: 'sykmelding-1' }) },
                        { sykmeldingId: 'sykmelding-1' },
                    ),
                ],
            },
        )

        expect(screen.getByRole('link', { name: /Sykmelding/ })).toHaveAttribute(
            'href',
            '/sykmeldt/test-id/sykmelding/sykmelding-1',
        )
    })

    it('should sort by date, newest first', () => {
        const sykmeldinger = [
            createSykmelding({
                id: 'sykmelding-1',
                perioder: [createAktivitetIkkeMuligPeriode({ fom: '2020-01-01', tom: '2020-01-05' })],
            }),
            createSykmelding({
                id: 'sykmelding-2',
                perioder: [createAktivitetIkkeMuligPeriode({ fom: '2022-01-01', tom: '2022-01-05' })],
            }),
            createSykmelding({
                id: 'sykmelding-3',
                perioder: [createAktivitetIkkeMuligPeriode({ fom: '2019-01-01', tom: '2019-01-05' })],
            }),
        ]

        render(<SykmeldingerList sykmeldtId="test-id" sykmeldt={createPreviewSykmeldt({ sykmeldinger })} />, {
            initialState: sykmeldinger.map((sykmelding) =>
                createInitialQuery(
                    SykmeldingByIdDocument,
                    { __typename: 'Query', sykmelding: sykmelding },
                    { sykmeldingId: sykmelding.id },
                ),
            ),
        })

        const unreadSection = within(screen.getByRole('region', { name: 'Uleste' }))
        const links = unreadSection.getAllByRole('link', { name: /Sykmelding/ })

        expect(links).toHaveLength(3)
        expect(links[0]).toHaveTextContent('1. januar 2022 - 5. januar 2022')
        expect(links[1]).toHaveTextContent('1. januar 2020 - 5. januar 2020')
        expect(links[2]).toHaveTextContent('1. januar 2019 - 5. januar 2019')
    })
})

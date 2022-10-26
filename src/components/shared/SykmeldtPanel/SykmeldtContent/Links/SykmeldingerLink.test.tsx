import { createSykmelding } from '../../../../../utils/test/dataCreators'
import { render, screen } from '../../../../../utils/test/testUtils'

import SykmeldingerLink from './SykmeldingerLink'

describe('SykmeldingerLink', () => {
    it('should link to sykmeldinger when there are no unread items', () => {
        const sykmeldinger = [createSykmelding({ lest: true })]

        render(<SykmeldingerLink sykmeldtId="test-id" sykmeldinger={sykmeldinger} />)

        expect(screen.getByRole('link')).toHaveAttribute('href', '/sykmeldt/test-id/sykmeldinger')
    })

    it('should link to sykmeldinger if only one unread', () => {
        const sykmeldinger = [
            createSykmelding({ id: 'sykmelding-1', lest: false }),
            createSykmelding({ id: 'sykmelding-2', lest: true }),
            createSykmelding({ id: 'sykmelding-3', lest: true }),
        ]

        render(<SykmeldingerLink sykmeldtId="test-id" sykmeldinger={sykmeldinger} />)

        expect(screen.getByRole('link')).toHaveAttribute('href', '/sykmeldt/test-id/sykmeldinger')
    })

    it('should link to sykmeldinger when there are multiple unread', () => {
        const sykmeldinger = [
            createSykmelding({ id: 'sykmelding-1', lest: false }),
            createSykmelding({ id: 'sykmelding-2', lest: false }),
            createSykmelding({ id: 'sykmelding-3', lest: true }),
        ]

        render(<SykmeldingerLink sykmeldtId="test-id" sykmeldinger={sykmeldinger} />)

        expect(screen.getByRole('link')).toHaveAttribute('href', '/sykmeldt/test-id/sykmeldinger')
    })
})

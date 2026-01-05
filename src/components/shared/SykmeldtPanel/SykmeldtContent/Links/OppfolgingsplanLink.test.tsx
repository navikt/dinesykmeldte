import { describe, it, expect } from 'vitest'

import { render, screen } from '../../../../../utils/test/testUtils'
import { OppfolgingsplanFragment } from '../../../../../graphql/queries/graphql.generated'

import OppfolgingsplanLink from './OppfolgingsplanLink'

describe('OppfolgingsplanLink', () => {
    it('should link to redirect without IDs if no hendelser', () => {
        const hendelser: OppfolgingsplanFragment[] = []

        render(<OppfolgingsplanLink sykmeldtId="test-id" oppfolgingsplaner={hendelser} />)

        expect(screen.getByRole('link')).toHaveAttribute(
            'href',
            'https://www.nav.no/syk/oppfolgingsplaner/arbeidsgiver/test-id',
        )
    })
})

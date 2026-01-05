import { describe, it, expect } from 'vitest'

import { render, screen } from '../../../../../utils/test/testUtils'
import { DialogmoteFragment } from '../../../../../graphql/queries/graphql.generated'

import DialogmoteLink from './DialogmoteLink'

describe('DialogmoteLink', () => {
    it('should link to redirect without IDs if no hendelser', () => {
        const hendelser: DialogmoteFragment[] = []

        render(<DialogmoteLink sykmeldtId="test-id" dialogmoter={hendelser} />)

        expect(screen.getByRole('link')).toHaveAttribute(
            'href',
            'https://www.nav.no/syk/dialogmoter/arbeidsgiver/test-id',
        )
    })
})

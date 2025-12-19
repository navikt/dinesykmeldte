import { describe, it, expect } from 'vitest'

import { createDialogmote } from '../../../../../utils/test/dataCreators'
import { render, screen } from '../../../../../utils/test/testUtils'
import { DialogmoteFragment } from '../../../../../graphql/queries/graphql.generated'

import DialogmoteLink from './DialogmoteLink'

describe('DialogmoteLink', () => {
    // TODO fix
    it.skip('should link to redirect without IDs if no hendelser', () => {
        const hendelser: DialogmoteFragment[] = []

        render(<DialogmoteLink sykmeldtId="test-id" dialogmoter={hendelser} />)

        expect(screen.getByRole('link')).toHaveAttribute('href', '/fake/basepath/dialogmoter/test-id')
    })

    // TODO fix
    it.skip('should link to redirect with IDs and list tekst', () => {
        const hendelser = [
            createDialogmote({ hendelseId: 'hendelse-1', tekst: 'Hendelse 1 tekst veldig bra' }),
            createDialogmote({ hendelseId: 'hendelse-2', tekst: 'Hendelse 2 tekst noko anna' }),
        ]

        render(<DialogmoteLink sykmeldtId="test-id" dialogmoter={hendelser} />)
        const listItems = screen.getAllByRole('listitem')

        expect(screen.getByRole('link')).toHaveAttribute(
            'href',
            '/fake/basepath/dialogmoter/test-id?hendelser=hendelse-1&hendelser=hendelse-2',
        )
        expect(listItems[0]).toHaveTextContent('Hendelse 1 tekst veldig bra')
        expect(listItems[1]).toHaveTextContent('Hendelse 2 tekst noko anna')
    })
})

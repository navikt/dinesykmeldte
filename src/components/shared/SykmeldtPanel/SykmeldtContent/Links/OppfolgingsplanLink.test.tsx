import { describe, it, expect } from 'vitest'

import { createOppfolgingsplan } from '../../../../../utils/test/dataCreators'
import { render, screen } from '../../../../../utils/test/testUtils'
import { OppfolgingsplanFragment } from '../../../../../graphql/queries/graphql.generated'

import OppfolgingsplanLink from './OppfolgingsplanLink'

describe('OppfolgingsplanLink', () => {
    it('should link to redirect without IDs if no hendelser', () => {
        const hendelser: OppfolgingsplanFragment[] = []

        render(<OppfolgingsplanLink sykmeldtId="test-id" oppfolgingsplaner={hendelser} isPilotUser={false} />)

        expect(screen.getByRole('link')).toHaveAttribute('href', '/fake/basepath/oppfolgingsplaner/test-id')
    })

    it('should link to redirect with IDs and list tekst', () => {
        const hendelser: OppfolgingsplanFragment[] = [
            createOppfolgingsplan({ hendelseId: 'hendelse-1', tekst: 'Hendelse 1 tekst veldig bra' }),
            createOppfolgingsplan({ hendelseId: 'hendelse-2', tekst: 'Hendelse 2 tekst noko anna' }),
        ]

        render(<OppfolgingsplanLink sykmeldtId="test-id" oppfolgingsplaner={hendelser} isPilotUser={false} />)
        const listItems = screen.getAllByRole('listitem')

        expect(screen.getByRole('link')).toHaveAttribute(
            'href',
            '/fake/basepath/oppfolgingsplaner/test-id?hendelser=hendelse-1&hendelser=hendelse-2',
        )
        expect(listItems[0]).toHaveTextContent('Hendelse 1 tekst veldig bra')
        expect(listItems[1]).toHaveTextContent('Hendelse 2 tekst noko anna')
    })
})

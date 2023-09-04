import { describe, it, expect } from 'vitest'

import { render, screen } from '../../../utils/test/testUtils'

import { ListItem } from './ListItem'

describe('ListItem', () => {
    it('should show multiple lines with text', () => {
        render(<ListItem title="Navn og fødselsnummer" text={['Fornavn Etternavn', '09876654321']} headingLevel="3" />)

        expect(screen.getByText('Fornavn Etternavn')).toBeInTheDocument()
        expect(screen.getByText('09876654321')).toBeInTheDocument()
    })
})

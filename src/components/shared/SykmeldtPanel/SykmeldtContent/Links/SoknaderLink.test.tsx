import {
    createPreviewFremtidigSoknad,
    createPreviewNySoknad,
    createPreviewSendtSoknad,
} from '../../../../../utils/test/dataCreators'
import { render, screen } from '../../../../../utils/test/testUtils'

import SoknaderLink from './SoknaderLink'

describe('SoknaderLink', () => {
    it('should link to soknader when there are no unread items', () => {
        const soknader = [createPreviewSendtSoknad({ lest: true })]

        render(<SoknaderLink sykmeldtId="test-id" soknader={soknader} />)

        expect(screen.getByRole('link')).toHaveAttribute('href', '/sykmeldt/test-id/soknader')
    })

    it('should link to soknader if only one unread and soknad is sendt', () => {
        const soknader = [
            createPreviewSendtSoknad({ id: 'soknad-1', lest: false }),
            createPreviewSendtSoknad({ id: 'soknad-2', lest: true }),
            createPreviewSendtSoknad({ id: 'soknad-3', lest: true }),
            createPreviewSendtSoknad({ id: 'soknad-4', lest: true }),
        ]

        render(<SoknaderLink sykmeldtId="test-id" soknader={soknader} />)

        expect(screen.getByRole('link')).toHaveAttribute('href', '/sykmeldt/test-id/soknader')
    })

    it('should link soknader if only one unread and soknad is ny', () => {
        const soknader = [
            createPreviewNySoknad({ id: 'soknad-1' }),
            createPreviewSendtSoknad({ id: 'soknad-2', lest: true }),
            createPreviewSendtSoknad({ id: 'soknad-3', lest: true }),
        ]

        render(<SoknaderLink sykmeldtId="test-id" soknader={soknader} />)

        expect(screen.getByRole('link')).toHaveAttribute('href', '/sykmeldt/test-id/soknader')
    })

    it('should link soknader if only one unread and soknad is fremtidig', () => {
        const soknader = [
            createPreviewFremtidigSoknad({ id: 'soknad-1' }),
            createPreviewSendtSoknad({ id: 'soknad-2', lest: true }),
            createPreviewSendtSoknad({ id: 'soknad-3', lest: true }),
        ]

        render(<SoknaderLink sykmeldtId="test-id" soknader={soknader} />)

        expect(screen.getByRole('link')).toHaveAttribute('href', '/sykmeldt/test-id/soknader')
    })

    it('should link to soknader when there are multiple unread', () => {
        const soknader = [
            createPreviewSendtSoknad({ id: 'soknad-1', lest: false }),
            createPreviewSendtSoknad({ id: 'soknad-2', lest: false }),
            createPreviewSendtSoknad({ id: 'soknad-3', lest: true }),
        ]

        render(<SoknaderLink sykmeldtId="test-id" soknader={soknader} />)

        expect(screen.getByRole('link')).toHaveAttribute('href', '/sykmeldt/test-id/soknader')
    })

    it('should display description for 1 unread sendt soknad', () => {
        const soknader = [createPreviewSendtSoknad({ id: 'soknad-1', lest: false })]

        render(<SoknaderLink sykmeldtId="test-id" soknader={soknader} />)

        expect(screen.getByText('1 sendt søknad')).toBeInTheDocument()
    })

    it('should display description for 2 unread sendt soknad', () => {
        const soknader = [
            createPreviewSendtSoknad({ id: 'soknad-1', lest: false }),
            createPreviewSendtSoknad({ id: 'soknad-2', lest: false }),
        ]

        render(<SoknaderLink sykmeldtId="test-id" soknader={soknader} />)

        expect(screen.getByText('2 sendte søknader')).toBeInTheDocument()
    })

    it('should display description for 1 unread ny soknad', () => {
        const soknader = [createPreviewNySoknad({ id: 'soknad-1', lest: false, ikkeSendtSoknadVarsel: true })]

        render(<SoknaderLink sykmeldtId="test-id" soknader={soknader} />)

        expect(screen.getByText('Vi mangler 1 søknad')).toBeInTheDocument()
    })

    it('should display description for 3 unread ny soknad', () => {
        const soknader = [
            createPreviewNySoknad({ id: 'soknad-1', lest: false, ikkeSendtSoknadVarsel: true }),
            createPreviewNySoknad({ id: 'soknad-2', lest: false, ikkeSendtSoknadVarsel: true }),
            createPreviewNySoknad({ id: 'soknad-3', lest: false, ikkeSendtSoknadVarsel: true }),
        ]

        render(<SoknaderLink sykmeldtId="test-id" soknader={soknader} />)

        expect(screen.getByText('Vi mangler 3 søknader')).toBeInTheDocument()
    })
})

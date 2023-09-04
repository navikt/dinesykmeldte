import { describe, it, expect } from 'vitest'

import { createPreviewSendtSoknad, createSykmelding, createPreviewSykmeldt } from '../../../../utils/test/dataCreators'
import { render, screen } from '../../../../utils/test/testUtils'

import SykmeldtSummary from './SykmeldtSummary'

describe('SykmeldtCard', () => {
    it('should format new varsler when there is one unread sykmelding', () => {
        render(
            <SykmeldtSummary
                sykmeldt={createPreviewSykmeldt({
                    sykmeldinger: [createSykmelding({ lest: false })],
                })}
                notification
                notSentSoknad={false}
            />,
        )

        expect(screen.getByTitle('Du har 1 ulest varsel')).toBeInTheDocument()
    })

    it('should format new varsler when there is multiple unread', () => {
        render(
            <SykmeldtSummary
                sykmeldt={createPreviewSykmeldt({
                    sykmeldinger: [createSykmelding({ lest: false })],
                    previewSoknader: [createPreviewSendtSoknad({ lest: false })],
                })}
                notification
                notSentSoknad={false}
            />,
        )

        expect(screen.getByTitle('Du har 2 uleste varsler')).toBeInTheDocument()
    })
})

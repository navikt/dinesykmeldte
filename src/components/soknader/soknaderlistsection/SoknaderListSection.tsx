import { Cell, Grid, Heading, Modal } from '@navikt/ds-react'
import { Task } from '@navikt/ds-icons'
import React, { ReactElement, useState } from 'react'

import { PreviewSoknadFragment } from '../../../graphql/queries/graphql.generated'
import LinkPanel, { ButtonPanel } from '../../shared/links/LinkPanel'
import { formatDateRange } from '../../../utils/dateUtils'
import {
    getSoknadSykmeldingPeriodDescription,
    isPreviewSoknadNotifying,
    soknadByDateDesc,
} from '../../../utils/soknadUtils'
import { cleanId } from '../../../utils/stringUtils'

import SoknadModalContent from './soknadmodal/SoknadModalContent'
import SoknadTag from './SoknadTag'

interface Props {
    title: string
    sykmeldtId: string
    soknader: PreviewSoknadFragment[]
}

function SoknaderListSection({ title, soknader, sykmeldtId }: Props): ReactElement | null {
    if (soknader.length === 0) return null

    return (
        <section aria-labelledby={`soknader-list-${cleanId(title)}-header`} className="mb-16">
            <Heading id={`soknader-list-${cleanId(title)}-header`} size="medium" level="2" className="mb-2">
                {title}
            </Heading>
            <Grid>
                {soknader.sort(soknadByDateDesc).map((it) => (
                    <Cell key={it.id} xs={12}>
                        <SoknadPanel sykmeldtId={sykmeldtId} soknad={it} />
                    </Cell>
                ))}
            </Grid>
        </section>
    )
}

function SoknadPanel({ sykmeldtId, soknad }: { sykmeldtId: string; soknad: PreviewSoknadFragment }): ReactElement {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const notification = soknad.__typename !== 'PreviewNySoknad' && isPreviewSoknadNotifying(soknad)

    const commonProps = {
        detail: soknad.fom && soknad.tom ? formatDateRange(soknad.fom, soknad.tom) : undefined,
        Icon: Task,
        tag: <SoknadTag soknad={soknad} />,
        description: soknad.perioder.map((it) => getSoknadSykmeldingPeriodDescription(it)).join(', '),
        notify: notification,
    }

    if (soknad.__typename === 'PreviewSendtSoknad') {
        return (
            <LinkPanel href={`/sykmeldt/${sykmeldtId}/soknad/${soknad.id}`} {...commonProps}>
                Søknad om sykepenger
            </LinkPanel>
        )
    }

    return (
        <>
            <ButtonPanel onClick={() => setIsModalOpen(true)} {...commonProps}>
                Søknad om sykepenger
            </ButtonPanel>
            <Modal
                open={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                aria-labelledby={`soknad-modal-label-${soknad.id}`}
            >
                <SoknadModalContent
                    soknad={soknad}
                    labelId={`soknad-modal-label-${soknad.id}`}
                    onOk={() => setIsModalOpen(false)}
                />
            </Modal>
        </>
    )
}

export default SoknaderListSection

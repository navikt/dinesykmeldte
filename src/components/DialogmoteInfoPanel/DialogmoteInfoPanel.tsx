import React, { useEffect, useState } from 'react'
import { BodyShort, Button, Heading, Modal } from '@navikt/ds-react'
import { useSelector } from 'react-redux'
import { useQuery } from '@apollo/client'

import { logAmplitudeEvent } from '../../amplitude/amplitude'
import { RootState } from '../../state/store'
import DismissableVeileder from '../shared/veileder/DismissableVeileder'
import { MineSykmeldteDocument } from '../../graphql/queries/graphql.generated'
import { hasBeenSykmeldt6WeeksWithout16DaysOpphold } from '../../utils/sykmeldtUtils'

import styles from './DialogmoteInfoPanel.module.css'

function DialogmoteInfoPanel(): JSX.Element | null {
    const { data } = useQuery(MineSykmeldteDocument)
    const dialogmoteFeature = useSelector((state: RootState) => state.metadata.dialogmoteFeature)
    const [showModal, setShowModal] = useState<boolean>(false)
    const hasAny6WeekSykmeldte = data?.mineSykmeldte?.some(hasBeenSykmeldt6WeeksWithout16DaysOpphold) ?? false

    if (
        !hasAny6WeekSykmeldte ||
        dialogmoteFeature !== 'landing-page' ||
        localStorage.getItem('personalansvar-info') !== 'true'
    )
        return null

    return (
        <>
            <DismissableVeileder
                storageKey="dialogmote-info"
                title="Har du behov for et dialogmøte?"
                text={[
                    'Du kan når som helst i et sykefravær be NAV om et dialogmøte.',
                    'Velg en sykmeldt du ønsker møte med, og klikk på dialogmøter.',
                ]}
                onOk={() => setShowModal(true)}
            />
            <WasUsefulModal open={showModal} onClose={() => setShowModal(false)} />
        </>
    )
}

interface WasUsefulModalProps {
    open: boolean
    onClose: () => void
}

function WasUsefulModal({ open, onClose }: WasUsefulModalProps): JSX.Element {
    useEffect(() => {
        if (!open) return

        logAmplitudeEvent({
            eventName: 'modal åpnet',
            data: { tekst: 'Var dialogmøteinformasjon nyttig?' },
        })
    }, [open])

    return (
        <Modal
            open={open}
            onClose={() => {
                logAmplitudeEvent({
                    eventName: 'modal lukket',
                    data: { tekst: 'Dialogmøteinformasjon lukket uten tilbakemelding' },
                })
                onClose()
            }}
        >
            <Modal.Content className={styles.modalContent}>
                <Heading size="medium" level="2" spacing>
                    Var informasjonen nyttig?
                </Heading>
                <BodyShort>Vi ønsker å vite om informasjonen om behov for dialogmøte var nyttig for deg.</BodyShort>
                <div className={styles.buttonBox}>
                    <Button
                        variant="tertiary"
                        onClick={() => {
                            logAmplitudeEvent({
                                eventName: 'modal lukket',
                                data: { tekst: 'Dialogmøteinformasjon var ikke nyttig' },
                            })
                            onClose()
                        }}
                    >
                        Ikke nyttig
                    </Button>
                    <Button
                        onClick={() => {
                            logAmplitudeEvent({
                                eventName: 'modal lukket',
                                data: { tekst: 'Dialogmøteinformasjon var nyttig' },
                            })
                            onClose()
                        }}
                    >
                        Nyttig
                    </Button>
                </div>
            </Modal.Content>
        </Modal>
    )
}

export default DialogmoteInfoPanel

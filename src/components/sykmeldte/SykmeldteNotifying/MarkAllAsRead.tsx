import { useCallback, useState } from 'react'
import { Button } from '@navikt/ds-react'

import { logAmplitudeEvent } from '../../../amplitude/amplitude'

import MarkAllAsReadModal from './MarkAllAsReadModal'
import styles from './MarkAllAsRead.module.css'

function MarkAllAsRead(): JSX.Element | null {
    const [openModal, setOpenModal] = useState(false)
    const onCloseModal = useCallback((wasCancelled: boolean) => {
        setOpenModal(false)
        if (wasCancelled) {
            logAmplitudeEvent({
                eventName: 'modal lukket',
                data: { tekst: 'Marker alle sykmeldinger og søknader varsler som lest: avbryt' },
            })
        } else {
            logAmplitudeEvent({
                eventName: 'modal lukket',
                data: { tekst: 'Marker alle sykmeldinger og søknader varsler som lest: markert' },
            })
        }
    }, [])

    return (
        <>
            <Button
                className={styles.markAllAsReadButton}
                variant="tertiary"
                onClick={() => {
                    setOpenModal(true)
                }}
            >
                Merk varsler som lest
            </Button>
            {openModal && <MarkAllAsReadModal onClose={onCloseModal} />}
        </>
    )
}

export default MarkAllAsRead

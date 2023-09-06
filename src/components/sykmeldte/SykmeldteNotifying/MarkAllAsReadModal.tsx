import { ReactElement, useCallback } from 'react'
import { useMutation, useQuery } from '@apollo/client'
import { BodyShort, Button, Modal } from '@navikt/ds-react'
import { logger } from '@navikt/next-logger'

import {
    MarkAllSykmeldingerAndSoknaderAsReadDocument,
    MineSykmeldteDocument,
} from '../../../graphql/queries/graphql.generated'

interface Props {
    isModalOpen: boolean
    onClose: (wasCancelled: boolean) => void
}

function MarkAllAsReadModal({ isModalOpen, onClose }: Props): ReactElement {
    const [markAllSykmeldingerAndSoknaderAsRead, { loading }] = useMutation(
        MarkAllSykmeldingerAndSoknaderAsReadDocument,
    )
    const { refetch, loading: refetching } = useQuery(MineSykmeldteDocument)

    const handleMarkAllAsReadClick = useCallback(() => {
        ;(async () => {
            try {
                await markAllSykmeldingerAndSoknaderAsRead({
                    onCompleted: async () => {
                        await refetch()
                        onClose(false)
                    },
                })
                logger.info(`Marked all sykmelding and soknad notifications as read`)
            } catch (e) {
                logger.error(`Unable to mark all sykmelding and soknad notifications as read: ${e}`)
                throw e
            }
        })()
    }, [markAllSykmeldingerAndSoknaderAsRead, refetch, onClose])

    return (
        <Modal
            open={isModalOpen}
            onClose={() => onClose(true)}
            header={{
                heading: 'Du er på vei til å merke varsler som lest',
            }}
        >
            <Modal.Body className="max-w-md">
                <BodyShort className="mr-4" spacing>
                    Dette innebærer bare varsler du har mottatt om sykmeldinger og søknader. Du vil fortsatt finne
                    dokumentene om du klikker deg inn på den ansatte.
                </BodyShort>
                <BodyShort className="mr-4" spacing>
                    Dette påvirker ikke varslinger du har mottatt om oppfølging, dialogmøter og påminnelse om aktivitet
                    eller 39-uker.
                </BodyShort>
            </Modal.Body>
            <Modal.Footer>
                <Button onClick={handleMarkAllAsReadClick} loading={loading || refetching}>
                    Ok, merk som lest!
                </Button>
                <Button variant="secondary" onClick={() => onClose(true)}>
                    Tilbake
                </Button>
            </Modal.Footer>
        </Modal>
    )
}

export default MarkAllAsReadModal

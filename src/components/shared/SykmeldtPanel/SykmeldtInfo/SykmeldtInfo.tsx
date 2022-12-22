import React, { useCallback, useState } from 'react'
import { BodyLong, Button, Heading, Modal } from '@navikt/ds-react'
import { useApolloClient, useMutation } from '@apollo/client'
import { People, Office2, Caseworker } from '@navikt/ds-icons'
import { logger } from '@navikt/next-logger'

import { logAmplitudeEvent } from '../../../../amplitude/amplitude'
import {
    MineSykmeldteDocument,
    PreviewSykmeldtFragment,
    UnlinkSykmeldtDocument,
} from '../../../../graphql/queries/graphql.generated'
import LinkButton from '../../links/LinkButton'
import { addSpaceAfterEverySixthCharacter } from '../../../../utils/stringUtils'

import styles from './SykmeldtInfo.module.css'
import { InfoItem } from './InfoItem'

interface Props {
    sykmeldt: PreviewSykmeldtFragment
}

function SykmeldtInfo({ sykmeldt }: Props): JSX.Element {
    const [open, setOpen] = useState(false)
    const onClose = useCallback((wasCancelled: boolean) => {
        setOpen(false)
        if (wasCancelled) {
            logAmplitudeEvent({
                eventName: 'modal lukket',
                data: { tekst: 'fjern fra min oversikt: avbryt' },
            })
        } else {
            logAmplitudeEvent({
                eventName: 'modal lukket',
                data: { tekst: 'fjern fra min oversikt: fjernet sykmeldt' },
            })
        }
    }, [])

    return (
        <>
            <div className={styles.infoRoot}>
                <InfoItem
                    title="Fødselsnummer"
                    text={addSpaceAfterEverySixthCharacter(sykmeldt.fnr)}
                    Icon={People}
                    smallerIcon
                />
                <InfoItem title={sykmeldt.orgnavn} text={sykmeldt.orgnummer} Icon={Office2} />
                <InfoItem
                    title="Ikke din ansatt?"
                    text={
                        <LinkButton
                            onClick={() => {
                                setOpen(true)
                                logAmplitudeEvent({
                                    eventName: 'modal åpnet',
                                    data: { tekst: 'fjern fra min oversikt' },
                                })
                            }}
                        >
                            Fjern fra min oversikt
                        </LinkButton>
                    }
                    Icon={Caseworker}
                />
            </div>
            {open && <UnlinkModal sykmeldt={sykmeldt} onClose={onClose} />}
        </>
    )
}

interface UnlinkModalProps {
    onClose: (wasCancelled: boolean) => void
    sykmeldt: PreviewSykmeldtFragment
}

function UnlinkModal({ onClose, sykmeldt }: UnlinkModalProps): JSX.Element {
    const apolloClient = useApolloClient()
    const headingId = `soknad-modal-label-${sykmeldt.narmestelederId}`
    const [unlinkSykmeldt, { loading }] = useMutation(UnlinkSykmeldtDocument, {
        refetchQueries: [{ query: MineSykmeldteDocument }],
        awaitRefetchQueries: true,
    })

    const handleOnCancelled = (): void => onClose(true)
    const handleOnUnlinkClick = useCallback(
        () =>
            unlinkSykmeldt({
                variables: { sykmeldtId: sykmeldt.narmestelederId },
                onCompleted: (data, clientOptions) => {
                    // Debug: Trying to see if refetch is still containing the unlinked sykmeldt
                    const mineSykmeldteQueryData = apolloClient.readQuery({ query: MineSykmeldteDocument })
                    const removedSykmeldtId = clientOptions?.variables?.sykmeldtId

                    if (removedSykmeldtId) {
                        const removedSykmeldtStillInSykmeldte = clientOptions.variables?.sykmeldtId
                            ? mineSykmeldteQueryData?.mineSykmeldte?.find(
                                  (it) => it.narmestelederId === removedSykmeldtId,
                              )
                            : null
                        if (removedSykmeldtStillInSykmeldte) {
                            logger.error(
                                `Sykmeldt with id ${clientOptions.variables?.sykmeldtId} was still in sykmeldte list after refetch`,
                            )
                        }
                    }

                    // This is not debug
                    onClose(false)
                },
            }),
        [unlinkSykmeldt, sykmeldt.narmestelederId, apolloClient, onClose],
    )

    return (
        <Modal open onClose={handleOnCancelled} aria-labelledby={headingId}>
            <Modal.Content className={styles.meldeModalRoot}>
                <Heading id={headingId} size="medium" level="2" spacing>
                    Meld fra om endring
                </Heading>
                <BodyLong spacing>
                    Er du sikker på at du ikke lenger skal være registrert som leder for <b>{sykmeldt.navn}</b>? Dersom{' '}
                    {sykmeldt.navn} fortsatt er ansatt i din virksomhet, vil det bli sendt ny forespørsel om å oppgi
                    nærmeste leder i Altinn.
                </BodyLong>
                <div className={styles.meldeModalButtons}>
                    <Button variant="danger" onClick={handleOnUnlinkClick} loading={loading}>
                        Ja, fjern fra min oversikt
                    </Button>
                    <Button variant="secondary" onClick={handleOnCancelled}>
                        Avbryt
                    </Button>
                </div>
            </Modal.Content>
        </Modal>
    )
}

export default SykmeldtInfo

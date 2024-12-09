import React, { ReactElement, useCallback, useState } from 'react'
import { BodyLong, Button, Modal } from '@navikt/ds-react'
import { useApolloClient, useMutation } from '@apollo/client'
import { PersonIcon, Buildings2Icon, PersonPencilIcon } from '@navikt/aksel-icons'
import { logger } from '@navikt/next-logger'

import {
    MineSykmeldteDocument,
    PreviewSykmeldtFragment,
    UnlinkSykmeldtDocument,
} from '../../../../graphql/queries/graphql.generated'
import LinkButton from '../../links/LinkButton'
import { fnrText } from '../../../../utils/sykmeldtUtils'

import { InfoItem } from './InfoItem'

interface Props {
    sykmeldt: PreviewSykmeldtFragment
}

function SykmeldtInfo({ sykmeldt }: Props): ReactElement {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const onClose = useCallback(() => {
        setIsModalOpen(false)
    }, [])

    return (
        <>
            <div
                className="mb-6 flex justify-between rounded border border-border-default bg-gray-50 p-5 max-[600px]:flex-col max-[600px]:[&>div:not(:last-of-type)]:pb-4"
                aria-label={`Informasjon om ${sykmeldt.navn}`}
                role="group"
            >
                <InfoItem title="Fødselsnummer" text={fnrText(sykmeldt.fnr, false)} Icon={PersonIcon} />
                <InfoItem title={sykmeldt.orgnavn} text={`Org.nummer: ${sykmeldt.orgnummer}`} Icon={Buildings2Icon} />
                <InfoItem
                    title="Ikke din ansatt?"
                    text={
                        <LinkButton
                            onClick={() => {
                                setIsModalOpen(true)
                            }}
                        >
                            Fjern fra min oversikt
                        </LinkButton>
                    }
                    Icon={PersonPencilIcon}
                />
            </div>
            <UnlinkModal sykmeldt={sykmeldt} isModalOpen={isModalOpen} onClose={onClose} />
        </>
    )
}

interface UnlinkModalProps {
    isModalOpen: boolean
    onClose: (wasCancelled: boolean) => void
    sykmeldt: PreviewSykmeldtFragment
}

function UnlinkModal({ isModalOpen, onClose, sykmeldt }: UnlinkModalProps): ReactElement {
    const apolloClient = useApolloClient()
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
        <Modal
            open={isModalOpen}
            onClose={handleOnCancelled}
            header={{
                heading: 'Meld fra om endring',
                icon: <PersonPencilIcon />,
            }}
        >
            <Modal.Body className="max-w-md">
                <BodyLong>
                    {'Er du sikker på at du ikke lenger skal være registrert som leder for '}
                    <b>{sykmeldt.navn}</b>
                    {`? Dersom ${sykmeldt.navn} fortsatt er ansatt i din virksomhet, vil det 
                    bli sendt ny forespørsel om å oppgi nærmeste leder i Altinn.`}
                </BodyLong>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="danger" onClick={handleOnUnlinkClick} loading={loading}>
                    Ja, fjern fra min oversikt
                </Button>
                <Button variant="secondary" onClick={handleOnCancelled}>
                    Avbryt
                </Button>
            </Modal.Footer>
        </Modal>
    )
}

export default SykmeldtInfo

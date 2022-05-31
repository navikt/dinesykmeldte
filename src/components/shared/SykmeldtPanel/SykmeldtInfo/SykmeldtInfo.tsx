import React, { useCallback, useState } from 'react';
import { BodyLong, Button, Heading, Modal } from '@navikt/ds-react';
import { useMutation, useQuery } from '@apollo/client';
import { People, Office2, Caseworker } from '@navikt/ds-icons';

import {
    MineSykmeldteDocument,
    PreviewSykmeldtFragment,
    UnlinkSykmeldtDocument,
} from '../../../../graphql/queries/graphql.generated';
import LinkButton from '../../links/LinkButton';
import { addSpaceAfterEverySixthCharacter } from '../../../../utils/stringUtils';

import styles from './SykmeldtInfo.module.css';
import { InfoItem } from './InfoItem';

interface Props {
    sykmeldt: PreviewSykmeldtFragment;
}

function SykmeldtInfo({ sykmeldt }: Props): JSX.Element {
    const [open, setOpen] = useState(false);
    const onClose = useCallback(() => setOpen(false), []);

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
                    text={<LinkButton onClick={() => setOpen(true)}>Fjern fra min oversikt</LinkButton>}
                    Icon={Caseworker}
                />
            </div>
            {open && <UnlinkModal sykmeldt={sykmeldt} onClose={onClose} />}
        </>
    );
}

function UnlinkModal({ onClose, sykmeldt }: { onClose: () => void; sykmeldt: PreviewSykmeldtFragment }): JSX.Element {
    const headingId = `soknad-modal-label-${sykmeldt.narmestelederId}`;
    const [unlinkSykmeldt, { loading }] = useMutation(UnlinkSykmeldtDocument);
    const { refetch, loading: refetching } = useQuery(MineSykmeldteDocument);

    const onSuccess = useCallback(async () => {
        await refetch();
        onClose();
    }, [onClose, refetch]);

    const handleOnUnlinkClick = useCallback(() => {
        unlinkSykmeldt({ variables: { sykmeldtId: sykmeldt.narmestelederId }, onCompleted: onSuccess });
    }, [sykmeldt.narmestelederId, unlinkSykmeldt, onSuccess]);

    return (
        <Modal open onClose={onClose} aria-labelledby={headingId}>
            <Modal.Content className={styles.meldeModalRoot}>
                <Heading id={headingId} size="large" spacing>
                    Meld fra om endring
                </Heading>
                <BodyLong spacing>
                    Er du sikker på at du ikke lenger skal være registrert som leder for <b>{sykmeldt.navn}</b>? Dersom{' '}
                    {sykmeldt.navn} fortsatt er ansatt i din virksomhet, vil det bli sendt ny forespørsel om å oppgi
                    nærmeste leder i Altinn.
                </BodyLong>
                <div className={styles.meldeModalButtons}>
                    <Button variant="danger" onClick={handleOnUnlinkClick} loading={loading || refetching}>
                        Ja, fjern fra min oversikt
                    </Button>
                    <Button variant="secondary" onClick={onClose}>
                        Avbryt
                    </Button>
                </div>
            </Modal.Content>
        </Modal>
    );
}

export default SykmeldtInfo;

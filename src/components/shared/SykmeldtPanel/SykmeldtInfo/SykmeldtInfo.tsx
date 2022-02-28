import React, { useCallback, useState } from 'react';
import { BodyLong, BodyShort, Button, Heading, Link, Modal } from '@navikt/ds-react';

import {
    PreviewSykmeldtFragment,
    useMineSykmeldteQuery,
    useUnlinkSykmeldtMutation,
} from '../../../../graphql/queries/react-query.generated';
import { formatNameSubjective } from '../../../../utils/sykmeldtUtils';

import styles from './SykmeldtInfo.module.css';

interface Props {
    sykmeldt: PreviewSykmeldtFragment;
}

function SykmeldtInfo({ sykmeldt }: Props): JSX.Element {
    const [open, setOpen] = useState(false);
    const onClose = useCallback(() => setOpen(false), []);

    return (
        <>
            <div className={styles.infoRoot}>
                <BodyShort spacing size="small">
                    Av personvernhensyn vises dokumentene inntil fire måneder etter at medarbeideren har blitt frisk. Du
                    finner alle sykmeldinger i Altinn.
                </BodyShort>
                <BodyShort size="small" spacing>
                    Dersom du ikke er nærmeste leder for {formatNameSubjective(sykmeldt.navn)}, kan du{' '}
                    <Link className={styles.linkButton} as="button" onClick={() => setOpen(true)}>
                        melde endring til NAV
                    </Link>
                    .
                </BodyShort>
            </div>
            {open && <UnlinkModal sykmeldt={sykmeldt} onClose={onClose} />}
        </>
    );
}

function UnlinkModal({ onClose, sykmeldt }: { onClose: () => void; sykmeldt: PreviewSykmeldtFragment }): JSX.Element {
    const headingId = `soknad-modal-label-${sykmeldt.narmestelederId}`;
    const { mutate: unlinkSykmeldt, isLoading } = useUnlinkSykmeldtMutation();
    const { refetch, isRefetching } = useMineSykmeldteQuery();

    const onSuccess = useCallback(async () => {
        await refetch();
        onClose();
    }, [onClose, refetch]);

    const handleOnUnlinkClick = useCallback(() => {
        unlinkSykmeldt({ sykmeldtId: sykmeldt.narmestelederId }, { onSuccess: onSuccess });
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
                    <Button variant="danger" onClick={handleOnUnlinkClick} loading={isLoading || isRefetching}>
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

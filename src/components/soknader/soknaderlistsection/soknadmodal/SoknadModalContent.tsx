import React from 'react';
import { Button, Modal } from '@navikt/ds-react';

import { PreviewSoknadFragment } from '../../../../graphql/queries/react-query.generated';
import { getSoknadActivationDate } from '../../../../utils/soknadUtils';

import styles from './SoknadModalContent.module.css';

interface Props {
    soknad: PreviewSoknadFragment;
    labelId: string;
    onOk: () => void;
}

const SoknadModalContent = ({ soknad, labelId, onOk }: Props): JSX.Element => {
    switch (soknad.__typename) {
        case 'PreviewFremtidigSoknad':
            return (
                <Modal.Content>
                    <h2 id={labelId}>Søknad er ikke klar</h2>
                    <p>
                        Den ansatte får ikke fylle ut søknaden før sykefraværet er over:{' '}
                        <b>{getSoknadActivationDate(soknad.tom)}</b>
                    </p>
                    <p>Du blir varslet så fort søknaden er utfylt og sendt inn.</p>
                    <div className={styles.modalButtonWrapper}>
                        <Button className={styles.okButton} variant="secondary" size="small" onClick={onOk}>
                            OK
                        </Button>
                    </div>
                </Modal.Content>
            );
        case 'PreviewNySoknad':
            return (
                <Modal.Content>
                    <p id={labelId} className={styles.firstParagraph}>
                        Den ansatte har ikke sendt inn denne søknaden ennå.
                    </p>
                    <p>Du blir varslet så fort den er sendt.</p>
                    <div className={styles.modalButtonWrapper}>
                        <Button className={styles.okButton} variant="secondary" size="small" onClick={onOk}>
                            OK
                        </Button>
                    </div>
                </Modal.Content>
            );
        case 'PreviewKorrigertSoknad':
        case 'PreviewSendtSoknad':
            throw new Error('Korrigert and Sendt should not use this modal content');
    }
};

export default SoknadModalContent;

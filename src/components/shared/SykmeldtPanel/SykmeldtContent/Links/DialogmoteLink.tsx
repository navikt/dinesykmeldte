import React from 'react';
import { Dialog, DialogFilled } from '@navikt/ds-icons';

import { DialogmoteFragment } from '../../../../../graphql/queries/graphql.generated';
import LinkPanel from '../../../links/LinkPanel';

import styles from './DialogmoteLink.module.css';

interface Props {
    sykmeldtId: string;
    dialogmoter: DialogmoteFragment[];
}

const DialogmoteLink = ({ sykmeldtId, dialogmoter }: Props): JSX.Element => {
    if (!dialogmoter.length) {
        return (
            <LinkPanel Icon={Dialog} external href={`/dialogmoter/${sykmeldtId}`}>
                Dialogmøter
            </LinkPanel>
        );
    }

    return (
        <LinkPanel
            Icon={DialogFilled}
            external
            href={`/dialogmoter/${sykmeldtId}?hendelser=${dialogmoter.map((it) => it.id).join('&hendelser=')}`}
            notify={{
                notify: true,
                disableWarningBackground: true,
            }}
            description={<DialogDescription hendelser={dialogmoter} />}
        >
            Dialogmøter
        </LinkPanel>
    );
};

function DialogDescription({ hendelser }: { hendelser: DialogmoteFragment[] }): JSX.Element {
    return (
        <ul className={styles.hendelseList}>
            {hendelser.map((it) => (
                <li key={it.id}>{it.tekst}</li>
            ))}
        </ul>
    );
}

export default DialogmoteLink;

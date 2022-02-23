import React from 'react';
import { Dialog } from '@navikt/ds-icons';

import { HendelseFragment } from '../../../../../graphql/queries/react-query.generated';
import LinkPanel from '../../../links/LinkPanel';

import styles from './HendelserLink.module.css';

interface Props {
    sykmeldtId: string;
    hendelser: HendelseFragment[];
}

const HendelserLink = ({ sykmeldtId, hendelser }: Props): JSX.Element => {
    const sharedProps = {
        Icon: Dialog,
        external: true,
    };

    if (!hendelser.length) {
        return (
            <LinkPanel {...sharedProps} href={`/dialogmoter/${sykmeldtId}`}>
                Dialogmøter
            </LinkPanel>
        );
    }

    return (
        <LinkPanel
            {...sharedProps}
            href={`/dialogmoter/${sykmeldtId}?hendelser=${hendelser.map((it) => it.id).join('&hendelser=')}`}
            notify={{
                notify: true,
                disableWarningBackground: true,
            }}
            description={<DialogDescription hendelser={hendelser} />}
        >
            Dialogmøter
        </LinkPanel>
    );
};

function DialogDescription({ hendelser }: { hendelser: HendelseFragment[] }): JSX.Element {
    return (
        <ul className={styles.hendelseList}>
            {hendelser.map((it) => (
                <li key={it.id}>{it.tekst}</li>
            ))}
        </ul>
    );
}

export default HendelserLink;

import React from 'react';
import { Dialog, DialogFilled } from '@navikt/ds-icons';

import { DialogmoteFragment } from '../../../../../graphql/queries/graphql.generated';
import LinkPanel from '../../../links/LinkPanel';

import LinkMessageList from './LinkMessageList';

interface Props {
    sykmeldtId: string;
    dialogmoter: DialogmoteFragment[];
}

const DialogmoteLink = ({ sykmeldtId, dialogmoter }: Props): JSX.Element => {
    if (!dialogmoter.length) {
        return (
            <LinkPanel Icon={Dialog} external="proxy" href={`/dialogmoter/${sykmeldtId}`}>
                Dialogmøter
            </LinkPanel>
        );
    }

    return (
        <LinkPanel
            Icon={DialogFilled}
            external="proxy"
            href={`/dialogmoter/${sykmeldtId}?hendelser=${dialogmoter.map((it) => it.hendelseId).join('&hendelser=')}`}
            notify={{
                notify: true,
                disableWarningBackground: true,
            }}
            description={<LinkMessageList items={dialogmoter} />}
        >
            Dialogmøter
        </LinkPanel>
    );
};

export default DialogmoteLink;

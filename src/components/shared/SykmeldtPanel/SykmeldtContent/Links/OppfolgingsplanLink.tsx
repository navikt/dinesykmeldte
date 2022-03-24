import React from 'react';
import { Task } from '@navikt/ds-icons';

import LinkPanel from '../../../links/LinkPanel';
import { isLocalOrDemo } from '../../../../../utils/env';

interface Props {
    sykmeldtId: string;
}

const OppfolgingsplanLink = ({ sykmeldtId }: Props): JSX.Element => {
    return (
        <LinkPanel Icon={Task} external href={createOppfolgingsplanUrl(sykmeldtId)}>
            Oppfølgingsplaner
        </LinkPanel>
    );
};

export function createOppfolgingsplanUrl(narmestelederId: string): string {
    if (isLocalOrDemo) {
        return `https://oppfolgingsplanarbeidsgiver.labs.nais.io/syk/oppfolgingsplanarbeidsgiver/${narmestelederId}/oppfolgingsplaner`;
    }

    return `/syk/oppfolgingsplanarbeidsgiver/${narmestelederId}/oppfolgingsplaner`;
}

export default OppfolgingsplanLink;

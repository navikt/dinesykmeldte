import { Bandage } from '@navikt/ds-icons';
import React from 'react';

import { PreviewSykmeldtFragment } from '../../../../../graphql/queries/react-query.generated';
import LinkPanel from '../../../links/LinkPanel';

interface Props {
    sykmeldtId: string;
    sykmeldinger: NonNullable<PreviewSykmeldtFragment['previewSykmeldinger']>;
}

function SykmeldingerLink({ sykmeldtId, sykmeldinger }: Props): JSX.Element {
    const unreadItems = sykmeldinger.filter((it) => !it.lest);

    if (unreadItems.length === 0) {
        return (
            <LinkPanel href={`/sykmeldt/${sykmeldtId}/sykmeldinger`} Icon={Bandage}>
                Sykmeldinger
            </LinkPanel>
        );
    } else if (unreadItems.length === 1) {
        return (
            <LinkPanel
                href={`/sykmeldt/${sykmeldtId}/sykmelding/${unreadItems[0].id}`}
                Icon={Bandage}
                description={`1 ulest sykmelding`}
                notify={{
                    notify: true,
                    disableWarningBackground: true,
                }}
            >
                Sykmeldinger
            </LinkPanel>
        );
    } else {
        return (
            <LinkPanel
                href={`/sykmeldt/${sykmeldtId}/sykmeldinger`}
                Icon={Bandage}
                description={`${unreadItems.length} uleste sykmeldinger`}
                notify={{
                    notify: true,
                    disableWarningBackground: true,
                }}
            >
                Sykmeldinger
            </LinkPanel>
        );
    }
}

export default SykmeldingerLink;

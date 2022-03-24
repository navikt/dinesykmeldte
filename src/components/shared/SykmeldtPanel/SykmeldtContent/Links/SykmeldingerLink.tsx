import { Bandage, BandageFilled } from '@navikt/ds-icons';
import React from 'react';

import { PreviewSykmeldtFragment } from '../../../../../graphql/queries/graphql.generated';
import LinkPanel from '../../../links/LinkPanel';

interface Props {
    sykmeldtId: string;
    sykmeldinger: PreviewSykmeldtFragment['sykmeldinger'];
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
                Icon={BandageFilled}
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
                Icon={BandageFilled}
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

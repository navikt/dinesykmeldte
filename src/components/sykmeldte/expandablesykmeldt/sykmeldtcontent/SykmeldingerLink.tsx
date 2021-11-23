import { Bandage } from '@navikt/ds-icons';
import React from 'react';

import { PreviewSykmeldtFragment } from '../../../../graphql/queries/react-query.generated';
import { HighlightedLinkContent, PlainLinkContent } from '../../../shared/links/LinkContent';

interface Props {
    sykmeldtId: string;
    sykmeldinger: NonNullable<PreviewSykmeldtFragment['previewSykmeldinger']>;
}

function SykmeldingerLink({ sykmeldtId, sykmeldinger }: Props): JSX.Element {
    const unreadItems = sykmeldinger.filter((it) => !it.lest);

    if (unreadItems.length === 0) {
        return (
            <PlainLinkContent href={`/sykmeldt/${sykmeldtId}/sykmeldinger`} Icon={Bandage}>
                Sykmeldinger
            </PlainLinkContent>
        );
    } else if (unreadItems.length === 1) {
        return (
            <HighlightedLinkContent
                href={`/sykmeldt/${sykmeldtId}/sykmelding/${unreadItems[0].id}`}
                Icon={Bandage}
                description={`1 ulest sykmelding`}
            >
                Sykmeldinger
            </HighlightedLinkContent>
        );
    } else {
        return (
            <HighlightedLinkContent
                href={`/sykmeldt/${sykmeldtId}/sykmeldinger`}
                Icon={Bandage}
                description={`${unreadItems.length} uleste sykmeldinger`}
            >
                Sykmeldinger
            </HighlightedLinkContent>
        );
    }
}

export default SykmeldingerLink;

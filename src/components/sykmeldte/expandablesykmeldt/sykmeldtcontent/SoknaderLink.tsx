import { Task } from '@navikt/ds-icons';
import React from 'react';

import { PreviewSykmeldtFragment } from '../../../../graphql/queries/react-query.generated';
import { HighlightedLinkContent, PlainLinkContent } from '../../../shared/links/LinkContent';

interface Props {
    sykmeldtId: string;
    soknader: NonNullable<PreviewSykmeldtFragment['previewSoknader']>;
}

function SoknaderLink({ sykmeldtId, soknader }: Props): JSX.Element {
    const unreadItems = soknader.filter((it) => !it.lest);

    if (unreadItems.length === 0) {
        return (
            <PlainLinkContent href={`/sykmeldt/${sykmeldtId}/soknader`} Icon={Task}>
                Søknader
            </PlainLinkContent>
        );
    } else if (unreadItems.length === 1) {
        return (
            <HighlightedLinkContent
                href={`/sykmeldt/${sykmeldtId}/soknad/${unreadItems[0].id}`}
                Icon={Task}
                description={`1 ulest søknad`}
            >
                Søknader
            </HighlightedLinkContent>
        );
    } else {
        return (
            <HighlightedLinkContent
                href={`/sykmeldt/${sykmeldtId}/soknader`}
                Icon={Task}
                description={`${unreadItems.length} uleste søknader`}
            >
                Søknader
            </HighlightedLinkContent>
        );
    }
}

export default SoknaderLink;

import { Task } from '@navikt/ds-icons';
import React from 'react';

import { PreviewSykmeldtFragment } from '../../../../graphql/queries/react-query.generated';
import { HighlightedLinkPanel, LinkPanel } from '../../../shared/links/LinkPanel';

interface Props {
    sykmeldtId: string;
    soknader: NonNullable<PreviewSykmeldtFragment['previewSoknader']>;
}

function SoknaderLink({ sykmeldtId, soknader }: Props): JSX.Element {
    const unreadItems = soknader.filter((it) => !it.lest);

    if (unreadItems.length === 0) {
        return (
            <LinkPanel href={`/sykmeldt/${sykmeldtId}/soknader`} Icon={Task}>
                Søknader
            </LinkPanel>
        );
    } else if (unreadItems.length === 1) {
        return (
            <HighlightedLinkPanel
                href={`/sykmeldt/${sykmeldtId}/soknad/${unreadItems[0].id}`}
                Icon={Task}
                description={`1 ulest søknad`}
            >
                Søknader
            </HighlightedLinkPanel>
        );
    } else {
        return (
            <HighlightedLinkPanel
                href={`/sykmeldt/${sykmeldtId}/soknader`}
                Icon={Task}
                description={`${unreadItems.length} uleste søknader`}
            >
                Søknader
            </HighlightedLinkPanel>
        );
    }
}

export default SoknaderLink;

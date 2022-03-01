import { Task, TaskFilled } from '@navikt/ds-icons';
import React from 'react';

import { PreviewSykmeldtFragment } from '../../../../../graphql/queries/graphql.generated';
import LinkPanel from '../../../links/LinkPanel';
import { isPreviewSoknadNotification } from '../../../../../utils/soknadUtils';

interface Props {
    sykmeldtId: string;
    soknader: PreviewSykmeldtFragment['previewSoknader'];
}

function SoknaderLink({ sykmeldtId, soknader }: Props): JSX.Element {
    const unreadItems = soknader.filter((it) => isPreviewSoknadNotification(it));

    if (unreadItems.length === 0) {
        return (
            <LinkPanel href={`/sykmeldt/${sykmeldtId}/soknader`} Icon={Task}>
                Søknader
            </LinkPanel>
        );
    } else if (unreadItems.length === 1) {
        return (
            <LinkPanel
                href={`/sykmeldt/${sykmeldtId}/soknad/${unreadItems[0].id}`}
                Icon={TaskFilled}
                description={`1 ulest søknad`}
                notify={{
                    notify: true,
                    disableWarningBackground: true,
                }}
            >
                Søknader
            </LinkPanel>
        );
    } else {
        return (
            <LinkPanel
                href={`/sykmeldt/${sykmeldtId}/soknader`}
                Icon={TaskFilled}
                description={`${unreadItems.length} uleste søknader`}
                notify={{
                    notify: true,
                    disableWarningBackground: true,
                }}
            >
                Søknader
            </LinkPanel>
        );
    }
}

export default SoknaderLink;

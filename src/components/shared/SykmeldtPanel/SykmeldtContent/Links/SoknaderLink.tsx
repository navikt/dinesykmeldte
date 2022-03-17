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

    function getUnreadItemLink(): string {
        switch (unreadItems[0].__typename) {
            case 'PreviewSendtSoknad':
            case 'PreviewKorrigertSoknad':
                return `/sykmeldt/${sykmeldtId}/soknad/${unreadItems[0].id}`;
            default:
                return `/sykmeldt/${sykmeldtId}/soknader`;
        }
    }

    if (unreadItems.length === 0) {
        return (
            <LinkPanel href={`/sykmeldt/${sykmeldtId}/soknader`} Icon={Task}>
                Søknader
            </LinkPanel>
        );
    } else if (unreadItems.length === 1) {
        return (
            <LinkPanel
                href={getUnreadItemLink()}
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

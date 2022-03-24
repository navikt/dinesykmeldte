import React from 'react';

import { PreviewSykmeldtFragment } from '../../../graphql/queries/graphql.generated';
import { isPreviewSoknadNotification } from '../../../utils/soknadUtils';
import { notNull } from '../../../utils/tsUtils';
import { formatPeriodsRelative } from '../../../utils/sykmeldingPeriodUtils';

interface Props {
    sykmeldt: PreviewSykmeldtFragment;
    includeName: boolean;
}

const SykmeldtStatus = ({ sykmeldt, includeName }: Props): JSX.Element => {
    const unreadSykmeldinger = sykmeldt.sykmeldinger.filter((it) => !it.lest).length;
    const unreadSoknader = sykmeldt.previewSoknader.filter((it) => isPreviewSoknadNotification(it)).length;
    const dialogmoter = sykmeldt.dialogmoter.length;
    const totalUnread = unreadSoknader + unreadSykmeldinger + dialogmoter;

    switch (totalUnread) {
        case 0:
            return <SykmeldtPeriodStatus sykmeldt={sykmeldt} includeName={includeName} />;
        case 1:
            return <span>1 nytt varsel</span>;
        default:
            return <span>{totalUnread} nye varsler</span>;
    }
};

export function SykmeldtPeriodStatus({
    sykmeldt,
    includeName,
}: {
    sykmeldt: PreviewSykmeldtFragment;
    includeName: boolean;
}): JSX.Element {
    return <span>{formatPeriodsRelative(sykmeldt.navn, sykmeldt.sykmeldinger.filter(notNull), includeName).text}</span>;
}

export default SykmeldtStatus;

import React from 'react';

import { PreviewSykmeldtFragment } from '../../../graphql/queries/graphql.generated';
import { isPreviewSoknadNotification } from '../../../utils/soknadUtils';
import { notNull } from '../../../utils/tsUtils';
import Skeleton from '../Skeleton/Skeleton';
import { formatPeriodsRelative } from '../../../utils/sykmeldingPeriodUtils';
import useSykmeldingerByIds from '../../../hooks/useSykmeldingerByIds';

interface Props {
    sykmeldt: PreviewSykmeldtFragment;
    includeName: boolean;
}

const SykmeldtStatus = ({ sykmeldt, includeName }: Props): JSX.Element => {
    const unreadSykmeldinger = sykmeldt.previewSykmeldinger.filter((it) => !it.lest).length;
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
    const { loading, data, error } = useSykmeldingerByIds(sykmeldt);

    if (error) {
        return <span>Feil: Klarte ikke å laste detaljer</span>;
    }

    if (loading || !data) {
        return <Skeleton width={Math.random() * 200 + 100} />;
    }

    return <span>{formatPeriodsRelative(sykmeldt.navn, data.sykmeldinger.filter(notNull), includeName).text}</span>;
}

export default SykmeldtStatus;

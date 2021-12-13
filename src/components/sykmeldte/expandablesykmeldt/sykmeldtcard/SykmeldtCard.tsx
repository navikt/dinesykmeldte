import React from 'react';
import { BodyShort, Heading } from '@navikt/ds-react';
import cn from 'classnames';

import { PreviewSykmeldtFragment } from '../../../../graphql/queries/react-query.generated';
import { formatDate } from '../../../../utils/dateUtils';

import SykmeldtIcon from './sykmeldticon/SykmeldtIcon';
import styles from './SykmeldtCard.module.css';

interface Props {
    sykmeldt: PreviewSykmeldtFragment;
    notification: boolean;
}

function SykmeldtCard({ sykmeldt, notification }: Props): JSX.Element {
    return (
        <div className={cn(styles.accordionListItem)}>
            <SykmeldtIcon sykmeldt={sykmeldt} notification={notification} />
            <div>
                <Heading size="medium" level="3">
                    {sykmeldt.navn}
                </Heading>
                <BodyShort>{sykmeldtStatusText(sykmeldt)}</BodyShort>
            </div>
        </div>
    );
}

function sykmeldtStatusText(sykmeldt: PreviewSykmeldtFragment): string {
    const unreadSykmeldinger = sykmeldt.previewSykmeldinger.filter((it) => !it.lest).length;
    const unreadSoknader = sykmeldt.previewSoknader.filter((it) => !it.lest).length;
    const totalUnread = unreadSoknader + unreadSykmeldinger;

    switch (totalUnread) {
        case 0:
            return sykmeldtPeriodText(sykmeldt);
        case 1:
            return '1 ny varsel';
        default:
            return `${totalUnread} nye varsler`;
    }
}

function sykmeldtPeriodText(sykmeldt: PreviewSykmeldtFragment): string {
    // TODO formatèr etter korrekt logikk, hør med Bendik
    return formatDate(sykmeldt.previewSykmeldinger[0].tom);
}

export default SykmeldtCard;

import React from 'react';
import { BodyShort, Heading } from '@navikt/ds-react';
import cn from 'classnames';

import { PreviewSykmeldtFragment } from '../../../../graphql/queries/react-query.generated';
import { sykmeldtStatusText } from '../../../../utils/sykmeldtUtils';

import SykmeldtIcon from './SykmeldtIcon/SykmeldtIcon';
import styles from './SykmeldtSummary.module.css';

interface Props {
    sykmeldt: PreviewSykmeldtFragment;
    notification: boolean;
}

function SykmeldtSummary({ sykmeldt, notification }: Props): JSX.Element {
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

export default SykmeldtSummary;

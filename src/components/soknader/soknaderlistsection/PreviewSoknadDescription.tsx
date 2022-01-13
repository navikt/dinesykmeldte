import React from 'react';
import cn from 'classnames';

import { useSykmeldingByIdQuery } from '../../../graphql/queries/react-query.generated';
import { getSykmeldingPeriodDescription } from '../../../utils/sykmeldingUtils';

import styles from './PreviewSoknadDescription.module.css';

interface Props {
    sykmeldingId: string;
}

function PreviewSoknadDescription({ sykmeldingId }: Props): JSX.Element {
    const { data } = useSykmeldingByIdQuery({ sykmeldingId });

    if (data == null || data.sykmelding == null) {
        return <div className={styles.root} />;
    }

    return (
        <div className={cn(styles.root, styles.fadeIn)}>
            {data.sykmelding.perioder.map((it) => getSykmeldingPeriodDescription(it)).join(', ')}
        </div>
    );
}

export default PreviewSoknadDescription;

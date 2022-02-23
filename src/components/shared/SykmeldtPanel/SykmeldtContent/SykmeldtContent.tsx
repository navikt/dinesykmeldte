import React from 'react';

import { PreviewSykmeldtFragment } from '../../../../graphql/queries/react-query.generated';

import SykmeldingerLink from './Links/SykmeldingerLink';
import SoknaderLink from './Links/SoknaderLink';
import HendelserLink from './Links/HendelserLink';
import styles from './SykmeldtContent.module.css';

interface Props {
    sykmeldt: PreviewSykmeldtFragment;
    notification: boolean;
}

function SykmeldtContent({ sykmeldt }: Props): JSX.Element {
    return (
        <div className={styles.sykmeldtContentWrapper}>
            <SykmeldingerLink sykmeldtId={sykmeldt.narmestelederId} sykmeldinger={sykmeldt.previewSykmeldinger} />
            <SoknaderLink sykmeldtId={sykmeldt.narmestelederId} soknader={sykmeldt.previewSoknader} />
            <HendelserLink sykmeldtId={sykmeldt.narmestelederId} hendelser={sykmeldt.hendelser} />
        </div>
    );
}

export default SykmeldtContent;

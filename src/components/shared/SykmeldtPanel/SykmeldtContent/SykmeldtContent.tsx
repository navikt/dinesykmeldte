import React from 'react';

import { PreviewSykmeldtFragment } from '../../../../graphql/queries/graphql.generated';

import SykmeldingerLink from './Links/SykmeldingerLink';
import SoknaderLink from './Links/SoknaderLink';
import DialogmoteLink from './Links/DialogmoteLink';
import OppfolgingsplanLink from './Links/OppfolgingsplanLink';
import AktivitetsvarselLink from './Links/AktivitetsvarselLink';
import styles from './SykmeldtContent.module.css';

interface Props {
    sykmeldt: PreviewSykmeldtFragment;
    notification: boolean;
}

function SykmeldtContent({ sykmeldt }: Props): JSX.Element {
    return (
        <div className={styles.sykmeldtContentWrapper}>
            <SykmeldingerLink sykmeldtId={sykmeldt.narmestelederId} sykmeldinger={sykmeldt.sykmeldinger} />
            <SoknaderLink sykmeldtId={sykmeldt.narmestelederId} soknader={sykmeldt.previewSoknader} />
            <DialogmoteLink sykmeldtId={sykmeldt.narmestelederId} dialogmoter={sykmeldt.dialogmoter} />
            <OppfolgingsplanLink sykmeldtId={sykmeldt.narmestelederId} />
            <AktivitetsvarselLink
                sykmeldtId={sykmeldt.narmestelederId}
                aktivitetsvarsler={sykmeldt.aktivitetsvarsler}
            />
        </div>
    );
}

export default SykmeldtContent;

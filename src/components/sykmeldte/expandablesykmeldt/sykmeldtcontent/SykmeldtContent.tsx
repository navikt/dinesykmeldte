import React from 'react';

import { PreviewSykmeldtFragment } from '../../../../graphql/queries/react-query.generated';

import SykmeldingerLink from './SykmeldingerLink';
import SoknaderLink from './SoknaderLink';
import styles from './SykmeldtContent.module.css';

interface Props {
    sykmeldt: PreviewSykmeldtFragment;
    notification: boolean;
}

function SykmeldtContent({ sykmeldt }: Props): JSX.Element {
    return (
        <div className={styles.sykmeldtContentWrapper}>
            <SykmeldingerLink sykmeldtId={sykmeldt.fnr} sykmeldinger={sykmeldt.previewSykmeldinger ?? []} />
            <SoknaderLink
                // TODO don't use FNR for URL
                sykmeldtId={sykmeldt.fnr}
                soknader={sykmeldt.previewSoknader ?? []}
                title="Søknader om sykepenger"
                wordForms={{
                    single: 'søknad',
                    multiple: 'søknader',
                }}
            />
        </div>
    );
}

export default SykmeldtContent;

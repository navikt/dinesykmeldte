import React from 'react';

import { PreviewSoknadFragment, PreviewSykmeldtFragment } from '../../graphql/queries/react-query.generated';

import SoknaderListSection from './soknaderlistsection/SoknaderListSection';
import styles from './SoknaderList.module.css';

interface Props {
    sykmeldtId: string;
    sykmeldt: PreviewSykmeldtFragment;
}

function SoknaderList({ sykmeldtId, sykmeldt }: Props): JSX.Element {
    const { ny, korrigert, sendt, fremtidig } = groupPreviewSoknader(sykmeldt.previewSoknader);

    return (
        <div className={styles.listRoot}>
            <SoknaderListSection title="Planlagte søknader" soknader={fremtidig} sykmeldtId={sykmeldtId} />
            <SoknaderListSection title="Til utfylling" soknader={ny} sykmeldtId={sykmeldtId} />
            <SoknaderListSection title="Korrigerte søknader" soknader={korrigert} sykmeldtId={sykmeldtId} />
            <SoknaderListSection title="Sendte søknader" soknader={sendt} sykmeldtId={sykmeldtId} />
        </div>
    );
}

const byTypeName = (typeName: PreviewSoknadFragment['__typename']) => (soknad: PreviewSoknadFragment) =>
    soknad.__typename === typeName;

function groupPreviewSoknader(previewSoknader: PreviewSoknadFragment[]): {
    ny: PreviewSoknadFragment[];
    fremtidig: PreviewSoknadFragment[];
    sendt: PreviewSoknadFragment[];
    korrigert: PreviewSoknadFragment[];
} {
    return {
        ny: previewSoknader.filter(byTypeName('PreviewNySoknad')),
        fremtidig: previewSoknader.filter(byTypeName('PreviewFremtidigSoknad')),
        sendt: previewSoknader.filter(byTypeName('PreviewSendtSoknad')),
        korrigert: previewSoknader.filter(byTypeName('PreviewKorrigertSoknad')),
    };
}

export default SoknaderList;

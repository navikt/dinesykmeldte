import React from 'react';
import { BodyShort, Heading } from '@navikt/ds-react';

import { PreviewSoknadFragment, PreviewSykmeldtFragment } from '../../graphql/queries/graphql.generated';
import { formatNameSubjective } from '../../utils/sykmeldtUtils';
import { SectionListRoot } from '../shared/ListSection/ListSection';

import SoknaderListSection from './soknaderlistsection/SoknaderListSection';
import SoknaderVeilederInfo from './SoknaderveilederInfo/SoknaderVeilederInfo';

interface Props {
    sykmeldtId: string;
    sykmeldt: PreviewSykmeldtFragment;
}

function SoknaderList({ sykmeldtId, sykmeldt }: Props): JSX.Element {
    const { ny, sendt, fremtidig } = groupPreviewSoknader(sykmeldt.previewSoknader);
    const noSoknader = sykmeldt.previewSoknader.length === 0;

    return (
        <SectionListRoot>
            <SoknaderVeilederInfo name={sykmeldt.navn} unsentSoknad={ny.length > 0} />
            {noSoknader && <NoSoknaderMessage navn={sykmeldt.navn} />}
            <SoknaderListSection title="Sendte søknader" soknader={sendt} sykmeldtId={sykmeldtId} />
            <SoknaderListSection title="Planlagte søknader" soknader={fremtidig} sykmeldtId={sykmeldtId} />
            <SoknaderListSection title="Til utfylling" soknader={ny} sykmeldtId={sykmeldtId} />
        </SectionListRoot>
    );
}

function NoSoknaderMessage({ navn }: { navn: string }): JSX.Element {
    return (
        <div>
            <Heading size="medium" level="2">
                Nye søknader
            </Heading>
            <BodyShort>Du har ikke mottatt noen søknader fra {formatNameSubjective(navn)}.</BodyShort>
        </div>
    );
}

const byTypeName = (typeName: PreviewSoknadFragment['__typename']) => (soknad: PreviewSoknadFragment) =>
    soknad.__typename === typeName;

function groupPreviewSoknader(previewSoknader: PreviewSoknadFragment[]): {
    ny: PreviewSoknadFragment[];
    fremtidig: PreviewSoknadFragment[];
    sendt: PreviewSoknadFragment[];
} {
    return {
        ny: previewSoknader.filter(byTypeName('PreviewNySoknad')),
        fremtidig: previewSoknader.filter(byTypeName('PreviewFremtidigSoknad')),
        sendt: previewSoknader.filter(byTypeName('PreviewSendtSoknad')),
    };
}

export default SoknaderList;

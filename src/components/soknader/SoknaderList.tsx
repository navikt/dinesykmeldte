import React, { useEffect } from 'react'
import { BodyShort, Heading } from '@navikt/ds-react'
import { useMutation, useQuery } from '@apollo/client'

import {
    MarkSoknadReadDocument,
    MineSykmeldteDocument,
    PreviewSoknadFragment,
    PreviewSykmeldtFragment,
} from '../../graphql/queries/graphql.generated'
import { formatNameSubjective } from '../../utils/sykmeldtUtils'
import { previewNySoknaderUnread } from '../../utils/soknadUtils'
import { SectionListRoot } from '../shared/ListSection/ListSection'

import SoknaderListSection from './soknaderlistsection/SoknaderListSection'
import SoknaderVeilederInfo from './SoknaderveilederInfo/SoknaderVeilederInfo'

interface Props {
    sykmeldtId: string
    sykmeldt: PreviewSykmeldtFragment
}

function SoknaderList({ sykmeldtId, sykmeldt }: Props): JSX.Element {
    const { ny, uleste, leste, fremtidig } = groupPreviewSoknader(sykmeldt.previewSoknader)
    const noSoknader = sykmeldt.previewSoknader.length === 0
    const { refetch } = useQuery(MineSykmeldteDocument)
    const [markSoknadRead] = useMutation(MarkSoknadReadDocument)

    useEffect(() => {
        const nySoknadUnreadWithWarning: PreviewSoknadFragment[] = previewNySoknaderUnread(sykmeldt.previewSoknader)

        if (nySoknadUnreadWithWarning.length > 0) {
            nySoknadUnreadWithWarning.map((it) => {
                const soknadId = it.id
                ;(async () => {
                    await markSoknadRead({ variables: { soknadId } })
                    await refetch()
                })()
            })
        }
    }, [sykmeldt.previewSoknader, markSoknadRead, refetch])

    return (
        <SectionListRoot>
            <SoknaderVeilederInfo name={sykmeldt.navn} unsentSoknad={ny.length > 0} />
            {noSoknader && <NoSoknaderMessage navn={sykmeldt.navn} />}
            <SoknaderListSection title="Uleste søknader" soknader={uleste} sykmeldtId={sykmeldtId} />
            <SoknaderListSection title="Leste søknader" soknader={leste} sykmeldtId={sykmeldtId} />
            <SoknaderListSection title="Planlagte søknader" soknader={fremtidig} sykmeldtId={sykmeldtId} />
            <SoknaderListSection title="Til utfylling" soknader={ny} sykmeldtId={sykmeldtId} />
        </SectionListRoot>
    )
}

function NoSoknaderMessage({ navn }: { navn: string }): JSX.Element {
    return (
        <div>
            <Heading size="medium" level="2">
                Nye søknader
            </Heading>
            <BodyShort>Du har ikke mottatt noen søknader fra {formatNameSubjective(navn)}.</BodyShort>
        </div>
    )
}

const byTypeName = (typeName: PreviewSoknadFragment['__typename']) => (soknad: PreviewSoknadFragment) =>
    soknad.__typename === typeName

function groupPreviewSoknader(previewSoknader: PreviewSoknadFragment[]): {
    ny: PreviewSoknadFragment[]
    fremtidig: PreviewSoknadFragment[]
    uleste: PreviewSoknadFragment[]
    leste: PreviewSoknadFragment[]
} {
    return {
        ny: previewSoknader.filter(byTypeName('PreviewNySoknad')),
        fremtidig: previewSoknader.filter(byTypeName('PreviewFremtidigSoknad')),
        uleste: previewSoknader.filter((it) => it.__typename === 'PreviewSendtSoknad' && !it.lest),
        leste: previewSoknader.filter((it) => it.__typename === 'PreviewSendtSoknad' && it.lest),
    }
}

export default SoknaderList

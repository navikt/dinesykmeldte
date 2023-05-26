import React from 'react'
import dynamic from 'next/dynamic'
import { useQuery } from '@apollo/client'

import { VeilederBorder } from '../shared/veileder/Veileder'
import { MineSykmeldteDocument } from '../../graphql/queries/graphql.generated'

const DismissableVeileder = dynamic(() => import('../shared/veileder/DismissableVeileder'), {
    ssr: false,
})

function SykmeldteInfoPanel(): JSX.Element | null {
    const { data, loading } = useQuery(MineSykmeldteDocument)

    if (loading || !data) return null

    if (!data?.mineSykmeldte?.length) {
        return (
            <VeilederBorder
                text={[
                    'Hei, ingen av de medarbeiderene du er registrert som leder for har aktive sykmeldinger, og derfor vises de ikke her',
                    'Hvis du savner noen av medarbeiderne dine som er sykmeldt nå kan du kontakte dem i virksomheten som tar i mot sykmeldinger i Altinn. De melder inn hvem som er leder for den sykmeldte.',
                ]}
            />
        )
    }

    return (
        // @ts-expect-error Weird TS5.0 + Next 13.4 typing error
        <DismissableVeileder
            storageKey="personalansvar-info"
            text={[
                `Hei, vi har fått vite at du har personalansvar for noen som er sykmeldt i denne virksomheten.`,
                'Under finner du oversikten over sykmeldte medarbeiderne og tilhørende informasjon og tjenester som skal hjelpe deg med oppfølgingen.',
            ]}
        />
    )
}

export default SykmeldteInfoPanel

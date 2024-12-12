import React, { ReactElement } from 'react'
import { BodyLong, ExpansionCard, Label } from '@navikt/ds-react'
import { useSelector } from 'react-redux'
import { useDispatch } from 'react-redux'

import { RootState } from '../../state/store'
import expandedSlice from '../../state/expandedSlice'

function SoknaderInfo(): ReactElement {
    const dispatch = useDispatch()
    const infoSoknaderExpanded = useSelector((state: RootState) => state.expanded.infoSoknaderExpanded)

    return (
        <div className="mt-16">
            <ExpansionCard open={infoSoknaderExpanded} aria-labelledby="om-soknaden-title" size="small">
                <ExpansionCard.Header
                    onClick={() => {
                        return dispatch(expandedSlice.actions.toggleInfoSoknaderExpanded())
                    }}
                >
                    <ExpansionCard.Title id="om-soknaden-title">Om søknaden</ExpansionCard.Title>
                </ExpansionCard.Header>
                <ExpansionCard.Content>
                    <Label htmlFor="hvor-lenge">Hvor lenge vises søknaden?</Label>
                    <BodyLong id="hvor-lenge" spacing>
                        Søknaden vises her i fire måneder etter at den er sendt inn. Søknaden ligger også i Altinn så
                        lenge arbeidsgiveren anser det som nødvendig.
                    </BodyLong>

                    <Label htmlFor="vises-alle">Vises alle søknadene her?</Label>
                    <BodyLong id="vises-alle">
                        Noen søknader blir bare sendt til NAV, avhengig av om dere forskutterer sykepenger eller ikke.
                        De søknadene vises ikke her.
                    </BodyLong>
                </ExpansionCard.Content>
            </ExpansionCard>
        </div>
    )
}

export default SoknaderInfo

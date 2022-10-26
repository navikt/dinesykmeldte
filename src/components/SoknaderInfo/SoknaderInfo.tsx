import React from 'react'
import { Accordion, BodyLong, Label } from '@navikt/ds-react'
import { useSelector } from 'react-redux'
import { useDispatch } from 'react-redux'

import { RootState } from '../../state/store'
import expandedSlice from '../../state/expandedSlice'

import styles from './SoknaderInfo.module.css'

function SoknaderInfo(): JSX.Element {
    const dispatch = useDispatch()
    const infoSoknaderExpanded = useSelector((state: RootState) => state.expanded.infoSoknaderExpanded)

    return (
        <div className={styles.root}>
            <Accordion>
                <Accordion.Item open={infoSoknaderExpanded}>
                    <Accordion.Header onClick={() => dispatch(expandedSlice.actions.toggleInfoSoknaderExpanded())}>
                        Om søknaden
                    </Accordion.Header>
                    <Accordion.Content>
                        <Label>Hvor lenge vises søknaden?</Label>
                        <BodyLong spacing>
                            Søknaden vises her i fire måneder etter at den er sendt inn. Søknaden ligger også i Altinn
                            så lenge arbeidsgiveren anser det som nødvendig.
                        </BodyLong>

                        <Label>Vises alle søknadene her?</Label>
                        <BodyLong>
                            Noen søknader blir bare sendt til NAV, avhengig av om dere forskutterer sykepenger eller
                            ikke. De søknadene vises ikke her.
                        </BodyLong>
                    </Accordion.Content>
                </Accordion.Item>
            </Accordion>
        </div>
    )
}

export default SoknaderInfo

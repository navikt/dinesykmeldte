import React from 'react';
import { Accordion, BodyLong, Label } from '@navikt/ds-react';

import { useApplicationContext } from '../shared/StateProvider';

import styles from './SoknaderInfo.module.css';

function SoknaderInfo(): JSX.Element {
    const [state, dispatch] = useApplicationContext();
    return (
        <div className={styles.root}>
            <Accordion>
                <Accordion.Item open={state.infoSoknaderExpanded}>
                    <Accordion.Header onClick={() => dispatch({ type: 'toggleInfoSoknaderExpanded' })}>
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
    );
}

export default SoknaderInfo;

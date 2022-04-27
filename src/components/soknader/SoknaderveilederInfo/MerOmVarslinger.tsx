import React from 'react';
import { Accordion, BodyLong, BodyShort } from '@navikt/ds-react';

import styles from './MerOmVarslinger.module.css';

export const MerOmVarslinger = (): JSX.Element => {
    return (
        <Accordion className={styles.root}>
            <Accordion.Item>
                <Accordion.Header>Mer om varslinger for søknaden</Accordion.Header>
                <Accordion.Content>
                    <div className={styles.content}>
                        <BodyLong className={styles.intro}>
                            Den ansatte blir varslet via sms og e-post dagen etter at søknaden er tilgjengelig for
                            utfylling.
                        </BodyLong>
                        <BodyLong className={styles.intro}>Om søknaden fortsatt ikke er sendt inn etter:</BodyLong>
                        <div className={styles.weekWrapper}>
                            <BodyShort className={styles.week}>1 uke:</BodyShort>
                            <BodyLong>Den ansatte blir varslet på sms og e-post.</BodyLong>
                        </div>
                        <div className={styles.weekWrapper}>
                            <BodyShort className={styles.week}>2 uker:</BodyShort>
                            <BodyLong>Nærmeste leder varsles på e-post og Dine sykmeldte.</BodyLong>
                        </div>

                        <div className={styles.weekWrapper}>
                            <BodyShort className={styles.week}>3 uker:</BodyShort>
                            <BodyLong>Virksomheten varsles på e-post og sms, og får en infomelding i Altinn.</BodyLong>
                        </div>
                        <div className={styles.line}></div>
                    </div>
                </Accordion.Content>
            </Accordion.Item>
        </Accordion>
    );
};

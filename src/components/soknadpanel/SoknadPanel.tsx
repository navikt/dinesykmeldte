import React from 'react';
import { Task } from '@navikt/ds-icons';
import { Heading, Panel } from '@navikt/ds-react';

import { SoknadFragment } from '../../graphql/queries/graphql.generated';
import { ListItem } from '../shared/listItem/ListItem';

import { SporsmalVarianter } from './SporsmalVarianter/SporsmalVarianter';
import SoknadPerioder from './SoknadPerioder';
import styles from './SoknadPanel.module.css';

interface Props {
    soknad: SoknadFragment;
}

function SoknadPanel({ soknad }: Props): JSX.Element {
    return (
        <Panel className={styles.soknadPanelRoot} border>
            <div className={styles.iconHeader}>
                <Task />
                <Heading size="medium" level="2">
                    Oppsummering fra søknaden
                </Heading>
            </div>
            <div className={styles.content}>
                <section className={styles.infoSection}>
                    <ul className={styles.soknadListItemList}>
                        <ListItem title="Søknaden er sendt inn av" text={[soknad.navn, soknad.fnr]} />
                        {soknad.perioder.length > 0 && <SoknadPerioder perioder={soknad.perioder} />}
                    </ul>
                </section>
                <section className={styles.infoSection}>
                    <ul className={styles.soknadListItemList}>
                        {soknad.sporsmal.map((sporsmal, index) => {
                            return <SporsmalVarianter key={sporsmal.sporsmalstekst + index} sporsmal={sporsmal} />;
                        })}
                    </ul>
                </section>
            </div>
        </Panel>
    );
}

export default SoknadPanel;

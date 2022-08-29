import React from 'react';
import { BodyShort, Button, Heading } from '@navikt/ds-react';
import { Print } from '@navikt/ds-icons';

import { SoknadFragment } from '../../graphql/queries/graphql.generated';
import { ListItem } from '../shared/listItem/ListItem';
import { BlueInfoSection } from '../shared/BlueInfoSection/BlueInfoSection';
import { formatDate } from '../../utils/dateUtils';
import { shouldSporsmalVariantShow, getSoknadSykmeldingPeriod } from '../../utils/soknadUtils';
import { addSpaceAfterEverySixthCharacter } from '../../utils/stringUtils';

import { SporsmalVarianter } from './SporsmalVarianter/SporsmalVarianter';
import SoknadPerioder from './SoknadPerioder';
import styles from './SoknadPanel.module.css';

interface Props {
    soknad: SoknadFragment;
}

function SoknadPanel({ soknad }: Props): JSX.Element {
    return (
        <div className={styles.soknadPanelRoot}>
            <div className={styles.header}>
                <Heading size="small" level="2">
                    Oppsummering fra søknaden
                </Heading>
                <div className={styles.periods}>
                    {soknad.perioder.map((it) => (
                        <BodyShort key={it.fom} className={styles.period} size="small">
                            {getSoknadSykmeldingPeriod(it)}
                        </BodyShort>
                    ))}
                </div>
                <div className={styles.sentDateAndPrint}>
                    <BodyShort className={styles.sendtDate} size="small">
                        {`Sendt til deg ${formatDate(soknad.sendtDato)}`}
                    </BodyShort>
                    <Button
                        onClick={() => window.print()}
                        variant="tertiary"
                        className={styles.printButton}
                        icon={<Print />}
                    />
                </div>
            </div>
            <BlueInfoSection ariaLabelledBy="soknad-panel-info-section">
                <ul className={styles.soknadListItemList}>
                    <ListItem
                        title="Søknaden er sendt inn av"
                        text={[soknad.navn, addSpaceAfterEverySixthCharacter(soknad.fnr)]}
                    />
                    {soknad.perioder.length > 0 && <SoknadPerioder perioder={soknad.perioder} />}
                </ul>
            </BlueInfoSection>
            <ul className={styles.soknadListItemList}>
                {soknad.sporsmal
                    .filter((spm) => shouldSporsmalVariantShow(spm))
                    .map((sporsmal) => {
                        return (
                            <BlueInfoSection key={sporsmal.id} ariaLabelledBy="soknad-panel-sporsmal-section">
                                <SporsmalVarianter sporsmal={sporsmal} />
                            </BlueInfoSection>
                        );
                    })}
            </ul>
        </div>
    );
}

export default SoknadPanel;

import React from 'react';
import { BodyShort, Detail, Heading } from '@navikt/ds-react';

import { SykmeldingPeriodeFragment } from '../../../graphql/queries/react-query.generated';
import CheckboxExplanation from '../../shared/checkboxexplanation/CheckboxExplanation';

import { getArbeidsrelatertArsakText, getPeriodeDateRange, getPeriodeTitle } from './sykmeldigPeriodeUtils';
import styles from './SykmeldingPeriode.module.css';

interface Props {
    periode: SykmeldingPeriodeFragment;
}

function SykmeldingPeriode({ periode }: Props): JSX.Element {
    const periodeId = `${periode.fom}-${periode.tom}-header`;

    return (
        <li className={styles.sykmeldingPeriodeRoot} aria-labelledby={periodeId}>
            <Heading id={periodeId} size="xsmall" level="3">
                {getPeriodeTitle(periode)}
            </Heading>
            <Detail size="small" spacing>
                {getPeriodeDateRange(periode)}
            </Detail>
            <SykmeldingPeriodeDetail periode={periode} />
        </li>
    );
}

function SykmeldingPeriodeDetail({ periode }: Pick<Props, 'periode'>): JSX.Element | null {
    switch (periode.__typename) {
        case 'AktivitetIkkeMulig':
            if (periode.arbeidsrelatertArsak) {
                return (
                    <div>
                        <Detail>Forhold på arbeidsplassen vanskeliggjør arbeidsrelatert aktivitet</Detail>
                        {periode.arbeidsrelatertArsak.arsak.map((arsak) => (
                            <CheckboxExplanation key={arsak} text={getArbeidsrelatertArsakText(arsak)} />
                        ))}
                        {periode.arbeidsrelatertArsak.beskrivelse && (
                            <div>
                                <Detail>Nærmere beskrivelse:</Detail>
                                <BodyShort size="small">{periode.arbeidsrelatertArsak.beskrivelse}</BodyShort>
                            </div>
                        )}
                    </div>
                );
            }
            return <div />;
        case 'Avventende':
            return (
                <div>
                    <Detail>Innspill til arbeidsgiver om tilrettelegging</Detail>
                    <BodyShort size="small">{periode.tilrettelegging}</BodyShort>
                </div>
            );
        case 'Gradert':
            return (
                <div>
                    {periode.reisetilskudd && (
                        <CheckboxExplanation text="Pasienten kan være i delvis arbeid ved bruk av reisetilskudd" />
                    )}
                </div>
            );
        case 'Behandlingsdager':
            return null;
        case 'Reisetilskudd':
            return null;
    }
}

export default SykmeldingPeriode;

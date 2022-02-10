import React from 'react';
import { Task } from '@navikt/ds-icons';
import { Heading, Panel } from '@navikt/ds-react';

import { SoknadFragment, useSykmeldingByIdQuery } from '../../graphql/queries/react-query.generated';
import { ListItem } from '../shared/listItem/ListItem';
import { formatDateRange, diffInDays } from '../../utils/dateUtils';
import CheckboxExplanation from '../shared/checkboxexplanation/CheckboxExplanation';
import { ListItemCheckbox } from '../shared/listItemCheckbox/ListItemCheckbox';

import styles from './SoknadPanel.module.css';

interface Props {
    soknad: SoknadFragment;
}

function SoknadPanel({ soknad }: Props): JSX.Element {
    const sykmeldingId = soknad.sykmeldingId;
    const { data } = useSykmeldingByIdQuery({ sykmeldingId });

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
                        <ListItem
                            title="Søknaden gjelder for perioden"
                            text={[
                                formatDateRange(soknad.fom, soknad.tom),
                                'TODO: GRAD i ' + diffInDays(soknad.fom, soknad.tom) + ' dager',
                            ]}
                        />
                    </ul>
                    <CheckboxExplanation
                        text="Jeg vet at jeg kan miste retten tilsykepenger hvis opplysningene jeg gir ikke er riktige eller fullstendige. 
                    Jeg vet også at NAV kan hilde igjen eller kreve tilbake penger, og at å gi feil opplysninger kan være straffbart."
                        alignStart
                    />
                </section>
                <section className={styles.infoSectionCheckboxes}>
                    <ul className={styles.soknadListItemList}>
                        {/* TODO: change all fields til sporsmal and svar */}
                        <ListItemCheckbox
                            title={`Var du tilbake i fullt arbeid hos ${
                                data?.sykmelding?.arbeidsgiver.navn
                            } i løpet av perioden ${formatDateRange(soknad.fom, soknad.tom)}?`}
                            value={false}
                        />
                        <ListItemCheckbox
                            title={`Hadde du ferie i tidsrommet ${formatDateRange(soknad.fom, soknad.tom)}?`}
                            value={soknad.fravar?.some((it) => it.type === 'FERIE')}
                        />
                        <ListItemCheckbox
                            title={`Tok du permisjon mens du var sykmeldt ${formatDateRange(soknad.fom, soknad.tom)}?`}
                            value={soknad.fravar?.some((it) => it.type === 'PERMISJON')}
                        />
                        <ListItemCheckbox
                            title={`Var du på reise utenfor EØS mens du var sykmeldt ${formatDateRange(
                                soknad.fom,
                                soknad.tom,
                            )}?`}
                            value={soknad.fravar?.some((it) => it.type === 'UTLANDSOPPHOLD')}
                        />
                        <ListItemCheckbox
                            title={`I perioden ${formatDateRange(
                                soknad.fom,
                                soknad.tom,
                            )} var du {TODO: GRAD} sykmeldt fra
                        ${data?.sykmelding?.arbeidsgiver.navn}. Jobbet du noe i denne perioden? `}
                            value={false}
                        />
                        <ListItemCheckbox
                            title={`Har du vært under utdanning i løpet av perioden ${formatDateRange(
                                soknad.fom,
                                soknad.tom,
                            )}?`}
                            value={soknad.fravar?.some(
                                (it) => it.type === 'UTDANNING_DELTID' || it.type === 'UTDANNING_FULLTID',
                            )}
                        />
                    </ul>
                </section>
                <CheckboxExplanation
                    text="Jeg har lest all informasjonen jeg har fått i søknaden og bekreftet at opplysningene jeg har gitt er korrekte."
                    alignStart
                />
            </div>
        </Panel>
    );
}

export default SoknadPanel;

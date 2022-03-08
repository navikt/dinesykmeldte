import React from 'react';
import { Accordion, Cell, Grid } from '@navikt/ds-react';
import { Data, DialogReport, Helptext, SocialAid } from '@navikt/ds-icons';

import LinkPanel from '../shared/links/LinkPanel';
import { useApplicationContext } from '../shared/StateProvider';
import { getPublicEnv } from '../../utils/env';

import styles from './NarmestelederInfo.module.css';

const publicEnv = getPublicEnv();

const BASE_PATH = publicEnv.publicPath ?? '';

function NarmestelederInfo(): JSX.Element {
    const [state, dispatch] = useApplicationContext();
    return (
        <div className={styles.root}>
            <Accordion>
                <Accordion.Item open={state.infoPagesExpanded}>
                    <Accordion.Header onClick={() => dispatch({ type: 'toggleInfoPagesExpanded' })}>
                        Tips til deg som nærmeste leder
                    </Accordion.Header>
                    <Accordion.Content>
                        <Grid>
                            <Cell xs={12}>
                                <LinkPanel Icon={Helptext} href="/info/sporsmal-og-svar">
                                    Spørsmål og svar
                                </LinkPanel>
                            </Cell>
                            <Cell xs={12}>
                                <LinkPanel
                                    Icon={DialogReport}
                                    href="/info/oppfolging"
                                    description="Hva forventes av deg og den ansatte underveis i sykefraværet?"
                                >
                                    Oppfølging underveis i sykefraværet
                                </LinkPanel>
                            </Cell>
                            <Cell xs={12}>
                                <LinkPanel
                                    Icon={SocialAid}
                                    href="https://www.arbeidsmiljoportalen.no/"
                                    description="Finn kunnskap og digitale verktøy som hjelper dere med å forebygge arbeidsrelatert sykefravær."
                                    external
                                >
                                    Bedre arbeidsmiljø kan forebygge sykefravær
                                </LinkPanel>
                            </Cell>
                            <Cell xs={12}>
                                <LinkPanel
                                    Icon={Data}
                                    href="https://arbeidsgiver.nav.no/sykefravarsstatistikk/"
                                    description="Få hjelp til å forstå ved å sammenligne deg med andre i din næring."
                                    external
                                >
                                    Hvor er ditt potensiale?
                                </LinkPanel>
                            </Cell>
                        </Grid>
                    </Accordion.Content>
                </Accordion.Item>
            </Accordion>
            <video
                className={styles.narmestelederVideo}
                width="100%"
                height="auto"
                controls
                poster={`${BASE_PATH}/videos/naermesteleder.jpg`}
            >
                <source src={`${BASE_PATH}/videos/naermesteleder.mp4`} type="video/mp4" />
                <track
                    label="Norsk bokmål"
                    kind="captions"
                    srcLang="nb_no"
                    src={`${BASE_PATH}/videos/naermesteleder.vtt`}
                    default
                />
                <p>
                    Nettleseren din støtter ikke denne videoavspillingen.{' '}
                    <a href={`${BASE_PATH}/videos/naermesteleder.mp4`}>Gå direkte til videoklippet</a>
                </p>
            </video>
        </div>
    );
}

export default NarmestelederInfo;

import React, { ReactElement } from 'react'
import { ExpansionCard, HGrid } from '@navikt/ds-react'
import { BarChartIcon, ChatExclamationmarkIcon, QuestionmarkDiamondIcon, HandHeartIcon } from '@navikt/aksel-icons'
import { useDispatch, useSelector } from 'react-redux'

import LinkPanel from '../shared/links/LinkPanel'
import { browserEnv } from '../../utils/env'
import { RootState } from '../../state/store'
import expandedSlice from '../../state/expandedSlice'
import TilbakeLink from '../shared/TilbakeLink/TilbakeLink'
import { logAmplitudeEvent } from '../../amplitude/amplitude'

function NarmestelederInfo(): ReactElement {
    const dispatch = useDispatch()
    const infoPagesExpanded = useSelector((state: RootState) => state.expanded.infoPagesExpanded)
    return (
        <>
            <ExpansionCard
                open={infoPagesExpanded}
                aria-labelledby="narmasteleder-info-heading"
                className="mt-32"
                size="small"
            >
                <ExpansionCard.Header
                    onClick={() => {
                        dispatch(expandedSlice.actions.toggleInfoPagesExpanded())
                    }}
                >
                    <ExpansionCard.Title as="h2" id="narmasteleder-info-heading">
                        Tips til deg som nærmeste leder
                    </ExpansionCard.Title>
                </ExpansionCard.Header>
                <ExpansionCard.Content>
                    <HGrid gap="6">
                        <div>
                            <LinkPanel Icon={QuestionmarkDiamondIcon} href="/info/sporsmal-og-svar">
                                Spørsmål og svar
                            </LinkPanel>
                        </div>
                        <div>
                            <LinkPanel
                                Icon={ChatExclamationmarkIcon}
                                href="/info/oppfolging"
                                description="Hva forventes av deg og den ansatte underveis i sykefraværet?"
                            >
                                Oppfølging underveis i sykefraværet
                            </LinkPanel>
                        </div>
                        <div>
                            <LinkPanel
                                Icon={HandHeartIcon}
                                href="https://www.nav.no/arbeidsgiver/redusere-sykefravar"
                                description="Finn kunnskap og digitale verktøy som hjelper dere med å forebygge arbeidsrelatert sykefravær."
                                external="absolute"
                            >
                                Bedre arbeidsmiljø kan forebygge sykefravær
                            </LinkPanel>
                        </div>
                        <div>
                            <LinkPanel
                                Icon={BarChartIcon}
                                href="https://arbeidsgiver.nav.no/sykefravarsstatistikk/"
                                description="Utforsk potensialet i din virksomhet ved å sammenligne den med andre i din næring."
                                external="absolute"
                            >
                                Se sykefraværsstatistikk
                            </LinkPanel>
                        </div>
                    </HGrid>
                </ExpansionCard.Content>
            </ExpansionCard>
            <video
                className="mt-16"
                width="100%"
                height="auto"
                controls
                poster={`${browserEnv.cdnPublicPath}/videos/naermesteleder.jpg`}
                crossOrigin="anonymous"
                onPlay={() => {
                    logAmplitudeEvent({
                        eventName: 'video start',
                        data: { video: 'Nærmeste leder' },
                    })
                }}
                onPause={() => {
                    logAmplitudeEvent({
                        eventName: 'video stopp',
                        data: { video: 'Nærmeste leder' },
                    })
                }}
            >
                <source src={`${browserEnv.cdnPublicPath}/videos/naermesteleder.mp4`} type="video/mp4" />
                <track
                    label="Norsk bokmål"
                    kind="captions"
                    srcLang="nb_no"
                    src={`${browserEnv.cdnPublicPath}/videos/naermesteleder.vtt`}
                    default
                />
                <p>
                    Nettleseren din støtter ikke denne videoavspillingen.{' '}
                    <a href={`${browserEnv.cdnPublicPath}/videos/naermesteleder.mp4`}>Gå direkte til videoklippet</a>
                </p>
            </video>
            <div className="mt-16">
                <TilbakeLink text="Tilbake til arbeidsgiversiden" href="https://www.nav.no/no/bedrift" />
            </div>
        </>
    )
}

export default NarmestelederInfo

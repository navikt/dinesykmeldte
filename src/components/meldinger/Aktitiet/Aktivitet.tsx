import React, { useEffect } from 'react';
import { BodyLong, BodyShort, Heading, Label } from '@navikt/ds-react';
import Image from 'next/image';
import { useMutation } from '@apollo/client';

import { getPublicEnv } from '../../../utils/env';
import { MineSykmeldteDocument, MarkAktivitetvarselReadDocument } from '../../../graphql/queries/graphql.generated';
import { logger } from '../../../utils/logger';

import aktivitetsvarsel from './aktivitetsvarsel.svg';
import styles from './Aktivitet.module.css';

const publicEnv = getPublicEnv();

const BASE_PATH = publicEnv.publicPath ?? '';

interface Props {
    sykmeldtId: string;
    aktivitetsvarselId: string;
}

const Aktivitet = ({ sykmeldtId, aktivitetsvarselId }: Props): JSX.Element => {
    const [mutate] = useMutation(MarkAktivitetvarselReadDocument);

    useEffect(() => {
        (async () => {
            try {
                await mutate({ variables: { aktivitetsvarselId }, refetchQueries: [{ query: MineSykmeldteDocument }] });
                logger.info(`Marked aktivitetsvarsel with id ${aktivitetsvarselId} as read`);
            } catch (e) {
                logger.error(`Unable to mark aktivitetsvarsel with id ${aktivitetsvarselId} as read`);
                throw e;
            }
        })();
    }, [mutate, aktivitetsvarselId]);

    return (
        <>
            <Heading size="medium" spacing>
                Påminnelse om aktivitet
            </Heading>
            <BodyLong spacing>
                Arbeidstakeren din har snart vært sykmeldt i åtte uker. NAV skal vurdere om den sykmeldte oppfyller
                aktivitetsplikten og fortsatt har rett til sykepenger.
            </BodyLong>
            <div className={styles.aktivitetsvarselImage}>
                <Image src={aktivitetsvarsel} alt="arbeidsgiver og arbeidsdaker med en kaffekopp og et dokument" />
            </div>
            <Label>Den sykmeldtes aktivitetsplikt</Label>
            <BodyLong spacing>
                Alle sykmeldte har en plikt til å være i aktivitet hvis det er mulig. Aktivitet vil si å jobbe noe i
                kombinasjon med å være sykmeldt. Et eksempel er å jobbe 50 prosent og være 50 prosent sykmeldt.
            </BodyLong>
            <Label>Arbeidsgiverens tilretteleggingsplikt</Label>
            <BodyLong spacing>
                Aktivitetsplikten henger nært sammen med arbeidsgiverens muligheter for å tilrettelegge arbeidet. Som
                arbeidsgiver har du plikt til å tilrettelegge arbeidet så langt det er mulig, og bidra til løsninger som
                hindrer unødig sykefravær.
            </BodyLong>
            <Label>Arbeidsgiverens tilretteleggingsplikt</Label>
            <BodyLong spacing>
                Aktivitetsplikten henger nært sammen med arbeidsgiverens muligheter for å tilrettelegge arbeidet. Som
                arbeidsgiver har du plikt til å tilrettelegge arbeidet så langt det er mulig, og bidra til løsninger som
                hindrer unødig sykefravær.
            </BodyLong>

            <Label>Hva må du gjøre nå?</Label>
            <BodyLong spacing>
                Det er viktig at du har god dialog med arbeidstakeren om det er mulig å utføre noen av arbeidsoppgavene
                til tross for sykdom. Det kommer an på hva sykdommen tillater og hva det er praktisk mulig å få til på
                arbeidsplassen. Sammen skal dere lage en oppfølgingsplan som beskriver arbeidsoppgavene og hva som skal
                til for å gjøre noen av dem.
            </BodyLong>

            <BodyLong spacing>
                Hvis det ikke er mulig å legge til rette på arbeidsplassen, må du dokumentere dette i oppfølgingsplanen
                og sende den til NAV.
            </BodyLong>

            <ul className={styles.actionList}>
                <li>
                    <a href={`/oppfolgingsplaner/${sykmeldtId}`} target="_blank" rel="noopener noreferrer">
                        Lag en digital oppfølgingsplan nå
                    </a>
                </li>
                <li>eller</li>
                <li>
                    <a
                        href="https://www.nav.no/soknader/nb/bedrift/sykepenger/oppfolgingsplan"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Send en oppfølgingsplan til NAV i posten
                    </a>
                </li>
            </ul>

            <Label>NAVs vurdering</Label>
            <BodyLong>
                NAVs oppgave er å vurdere om aktivitetsplikten er oppfylt. Vurderingen baserer seg på opplysninger fra
                arbeidsgiveren og fra den som har sykmeldt arbeidstakeren. Utfallet av vurderingen kan være:
            </BodyLong>

            <ol className={styles.suggestionList}>
                <li>
                    <BodyShort>
                        Aktivitetsplikten er oppfylt fordi arbeidstakeren er delvis tilbake i arbeid. Utbetalingen av
                        sykepenger fortsetter.
                    </BodyShort>
                </li>
                <li>
                    <BodyShort>
                        Det gis unntak fra aktivitetsplikten på grunn av helsesituasjonen eller fordi det ikke er mulig
                        å tilrettelegge på arbeidsplassen. Utbetalingen av sykepenger fortsetter.
                    </BodyShort>
                </li>
                <li>
                    <BodyShort>
                        Aktivitetsplikten er ikke oppfylt. Den sykmeldte kan miste retten til sykepenger, og
                        utbetalingen stanses.
                    </BodyShort>
                </li>
            </ol>

            <video
                className={styles.aktivitetsvarselVideo}
                width="100%"
                height="auto"
                controls
                poster={`${BASE_PATH}/videos/aktivitetsplikt.jpg`}
            >
                <source src={`${BASE_PATH}/videos/aktivitetsplikt.mp4`} type="video/mp4" />
                <track
                    label="Norsk bokmål"
                    kind="captions"
                    srcLang="nb_no"
                    src={`${BASE_PATH}/videos/naermesteleder.vtt`}
                    default
                />
                <p>
                    Nettleseren din støtter ikke denne videoavspillingen.{' '}
                    <a href={`${BASE_PATH}/videos/aktivitetsplikt.mp4`}>Gå direkte til videoklippet</a>
                </p>
            </video>
        </>
    );
};

export default Aktivitet;

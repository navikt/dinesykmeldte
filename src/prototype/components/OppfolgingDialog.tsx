"use client";

import {
  BodyShort,
  Button,
  CopyButton,
  Detail,
  Heading,
  HStack,
  Link,
  Modal,
  Radio,
  RadioGroup,
  ReadMore,
  VStack,
} from "@navikt/ds-react";
import {
  addDays,
  differenceInCalendarDays,
  formatISO,
  parseISO,
} from "date-fns";
import { type ReactElement, useState } from "react";
import LinkButton from "../../components/shared/links/LinkButton";
import { usePrototype } from "../state/PrototypeContext";
import type { Ansatt, HandlingId } from "../types";
import { formatDato } from "../utils/format";
import styles from "./OppfolgingDialog.module.css";

export type DialogHandling =
  | HandlingId
  | "soknader"
  | "sykmeldinger"
  | "dokumenter"
  | "beskjeder"
  | "dialogmoter";

interface Props {
  ansatt: Ansatt;
  handling: DialogHandling | null;
  onClose: () => void;
}

const iso = (dato: Date): string => formatISO(dato, { representation: "date" });
const PLAN_DEMO = "https://demo.ekstern.dev.nav.no/syk/oppfolgingsplan/123";

const TITLER: Record<DialogHandling, string> = {
  "forbered-dm1": "Forbered dialogmøte 1",
  "skjul-dm1": "Skjul påminnelsen om dialogmøte 1?",
  "vis-dm1": "Påminnelse om dialogmøte 1",
  "ga-til-plan": "Oppfølgingsplan",
  "se-innkalling": "Innkalling til dialogmøte 2",
  "svar-motebehov": "Behov for møte med Nav",
  "se-sykmelding": "Sykmeldinger",
  sykmeldinger: "Sykmeldinger",
  soknader: "Søknader om sykepenger",
  "se-maksdato": "Sykepengedager",
  dokumenter: "Tjenester og dokumenter",
  beskjeder: "Beskjeder",
  dialogmoter: "Dialogmøter",
};

/** DM1 guidance does not collect a meeting date, outcome or reason for hiding. */
export function OppfolgingDialog({
  ansatt,
  handling,
  onClose,
}: Props): ReactElement | null {
  if (!handling) return null;
  return (
    <DialogInnhold
      key={`${ansatt.id}-${handling}`}
      ansatt={ansatt}
      handling={handling}
      onClose={onClose}
    />
  );
}

function DialogInnhold({
  ansatt,
  handling: startHandling,
  onClose,
}: Omit<Props, "handling"> & { handling: DialogHandling }): ReactElement {
  const { settDm1, motebehovFor, settMotebehov } = usePrototype();
  const [handling, setHandling] = useState<DialogHandling>(startHandling);
  const [feil, setFeil] = useState<string | null>(null);
  const [motebehov, setMotebehov] = useState<"ja" | "nei" | "usikker" | "">(
    motebehovFor(ansatt.id) ?? "",
  );
  const [motebehovBekreftet, setMotebehovBekreftet] = useState(false);
  const fornavn = ansatt.navn.split(" ")[0];
  const harSenereOppfolging =
    ansatt.dm1Relevans === "passert-fase" || !!ansatt.motebehov;
  const erEgetMotebehov = !ansatt.motebehov;
  const nyeSykmeldinger = ansatt.nyeDokumenter?.sykmeldinger ?? 0;
  const nyeSoknader = ansatt.nyeDokumenter?.soknader ?? 0;
  const nyeBeskjeder = ansatt.nyeDokumenter?.beskjeder ?? 0;
  const nyeDialogmoter = ansatt.nyeDokumenter?.dialogmoter ?? 0;
  const nyTekst = (antall: number): string =>
    antall > 0 ? ` · ${antall} ${antall === 1 ? "ny" : "nye"}` : "";

  const vis = (neste: DialogHandling): void => {
    setFeil(null);
    setHandling(neste);
  };

  const dm1Veiledning = (
    <section>
      <Detail>Arbeidsgiver har ansvaret</Detail>
      <Heading size="small" level="3">
        Dialogmøte 1
      </Heading>
      <BodyShort>
        Ved fullt sykefravær skal møtet holdes innen sju uker, med mindre det er
        åpenbart unødvendig. Ved gradert sykefravær skal det holdes når
        arbeidsgiver, den ansatte eller sykmelder mener det er hensiktsmessig.
      </BodyShort>
      <Button
        variant="secondary"
        size="small"
        onClick={() => vis("forbered-dm1")}
      >
        Forbered dialogmøte 1
      </Button>
    </section>
  );

  const invitasjon = `Hei ${fornavn}!\n\nJeg inviterer deg til dialogmøte 1 om mulighetene for å være i arbeid.\n\nTid: [dato og klokkeslett]\nSted: [møtested eller videolenke]\n\nVi tar utgangspunkt i oppfølgingsplanen og snakker om:\n• hvilke arbeidsoppgaver som fungerer, og hva som er vanskelig\n• muligheter for å tilpasse oppgaver, arbeidstid eller arbeidssted\n• hva vi prøver videre, hvem som gjør hva, og når vi følger opp.\n\nTenk gjerne gjennom dine erfaringer før møtet. Vi skal snakke om arbeid og funksjon, ikke diagnose.\n\nSi fra hvis tidspunktet må tilpasses, eller hvis du ønsker at sykmelder skal delta. Du kan også ha med tillitsvalgt eller verneombud.`;

  return (
    <Modal
      open
      onClose={onClose}
      width={720}
      header={{
        heading:
          handling === "svar-motebehov" && erEgetMotebehov
            ? "Meld behov for møte med Nav"
            : TITLER[handling],
      }}
    >
      <Modal.Body>
        <VStack gap="space-24">
          <Detail className={styles.person}>
            {ansatt.navn} · {ansatt.orgnavn}
          </Detail>

          {handling === "forbered-dm1" && (
            <>
              <div className={styles.note}>
                <BodyShort>
                  <strong>Du som arbeidsgiver har ansvaret for møtet.</strong>{" "}
                  Ved fullt sykefravær skal dialogmøte 1 holdes innen sju uker,
                  med mindre det er åpenbart unødvendig.
                </BodyShort>
                <BodyShort size="small" className={styles.ruleDetail}>
                  Ved gradert sykefravær skal møtet holdes når du, den ansatte
                  eller sykmelder mener det er hensiktsmessig.
                </BodyShort>
              </div>
              <ol className={styles.steps}>
                <li>
                  <strong>Avtal tidspunkt og inviter.</strong>
                  <span>
                    Avklar hvem som skal delta. Den ansatte skal medvirke og
                    delta i møtet. Lege eller annen sykmelder skal innkalles
                    hvis den ansatte ønsker det.
                  </span>
                </li>
                <li>
                  <strong>Bruk oppfølgingsplanen i møtet.</strong>
                  <span>
                    Gå gjennom hva som fungerer og hva dere kan tilrettelegge.
                    Snakk om arbeidsoppgaver og funksjon, ikke diagnose.
                  </span>
                  <span>
                    <LinkButton onClick={() => vis("ga-til-plan")}>
                      Finn fram oppfølgingsplanen
                    </LinkButton>
                  </span>
                </li>
                <li>
                  <strong>Skriv neste steg i oppfølgingsplanen.</strong>
                  <span>
                    Bli enige om hva dere prøver, hvem som gjør hva, og når dere
                    vurderer hvordan det går. Dokumenter også møtet etter
                    rutinene i virksomheten.
                  </span>
                </li>
              </ol>
              <ReadMore header={`Forslag til invitasjon til ${fornavn}`}>
                <BodyShort size="small" spacing>
                  Fyll inn tidspunkt og møtested etter at du har kopiert
                  teksten. Send invitasjonen i kanalen dere vanligvis bruker.
                </BodyShort>
                <div className={styles.invitation}>{invitasjon}</div>
                <CopyButton
                  copyText={invitasjon}
                  text="Kopier invitasjon"
                  activeText="Kopiert"
                  size="small"
                />
              </ReadMore>
              <ReadMore header="Hvem kan delta, og hvordan?">
                <VStack gap="space-12">
                  <BodyShort size="small">
                    Arbeidsgiver leder møtet. Sykmelder skal innkalles når den
                    ansatte alene, eller sammen med arbeidsgiver, ønsker det.
                    Avklar tidspunkt med sykmelder tidlig. Møtet kan holdes på
                    telefon, video eller hos sykmelder ved behov.
                  </BodyShort>
                  <BodyShort size="small">
                    Tillitsvalgt eller verneombud kan delta hvis den ansatte
                    ønsker det. Bedriftshelsetjenesten og Nav kan innkalles når
                    arbeidsgiver eller den ansatte ønsker det. Nav er vanligvis
                    ikke med i dialogmøte 1.
                  </BodyShort>
                </VStack>
              </ReadMore>
              <ReadMore header="Når kan møtet være åpenbart unødvendig?">
                <VStack gap="space-12">
                  <BodyShort size="small">
                    Et eksempel er at den ansatte snart er tilbake i fullt
                    arbeid uten behov for tilrettelegging. Vurder unntaket ut
                    fra den konkrete situasjonen sammen med den ansatte.
                  </BodyShort>
                  <BodyShort size="small">
                    Andre løpende samtaler fritar ikke automatisk fra
                    møteplikten. Formålet er å gå gjennom oppfølgingsplanen og
                    mulighetene for å være i arbeid.
                  </BodyShort>
                </VStack>
              </ReadMore>
              <ReadMore header="Les mer om ansvar og regler">
                <VStack gap="space-12">
                  <Link
                    href="https://www.nav.no/arbeidsgiver/oppfolging-sykmeldte"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Nav: Dialogmøte 1 og oppfølging av sykmeldte
                  </Link>
                  <Link
                    href="https://www.arbeidstilsynet.no/regelverk/lover/arbeidsmiljoloven--aml/"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Arbeidstilsynet: Arbeidsmiljøloven § 4-6
                  </Link>
                </VStack>
              </ReadMore>
            </>
          )}

          {handling === "skjul-dm1" && (
            <>
              <BodyShort>
                Du skjuler bare påminnelsen på denne siden. Det endrer ikke
                plikten til å holde dialogmøte 1.
              </BodyShort>
              <BodyShort size="small">
                Du oppgir ingen årsak, møtestatus eller dato. Du kan vise
                påminnelsen igjen senere.
              </BodyShort>
              <Detail>
                I demoen gjelder dette bare til siden lastes på nytt.
              </Detail>
            </>
          )}

          {handling === "vis-dm1" && (
            <BodyShort>
              Du kan vise påminnelsen om dialogmøte 1 igjen.
            </BodyShort>
          )}

          {handling === "ga-til-plan" && (
            <>
              <BodyShort>
                Oppfølgingsplanen samler arbeidsoppgaver, tilrettelegging,
                avtaler og tidspunkt for evaluering. Lag en plan sammen med den
                ansatte, eller oppdater planen dere allerede bruker.
              </BodyShort>
              <Link href={PLAN_DEMO} target="_blank" rel="noreferrer">
                Åpne demo av oppfølgingsplanen (ny fane)
              </Link>
              <Detail>
                Lenken åpner en egen demo med en annen fiktiv person.
              </Detail>
            </>
          )}

          {(handling === "sykmeldinger" || handling === "se-sykmelding") && (
            <>
              <BodyShort>
                {ansatt.antallSykmeldinger}{" "}
                {ansatt.antallSykmeldinger === 1
                  ? "sykmelding"
                  : "sykmeldinger"}{" "}
                i dette sykefraværet, som startet{" "}
                {formatDato(ansatt.forlopStart)}.
              </BodyShort>
              <div className={styles.documentList}>
                {[...ansatt.perioder].reverse().map((periode, index) => (
                  <div
                    className={styles.document}
                    key={`${periode.fom}-${periode.tom}`}
                  >
                    <div>
                      <HStack gap="space-8" align="center">
                        <strong>{periode.grad} % sykmeldt</strong>
                        {index < nyeSykmeldinger && (
                          <span className={styles.newBadge}>Ny</span>
                        )}
                      </HStack>
                      <BodyShort size="small">
                        {formatDato(periode.fom)} – {formatDato(periode.tom)}
                      </BodyShort>
                    </div>
                    <Detail>
                      {periode.erForlengelse
                        ? "Forlengelse"
                        : "Første sykmelding"}
                    </Detail>
                  </div>
                ))}
              </div>
            </>
          )}

          {handling === "soknader" && (
            <>
              <BodyShort>
                {ansatt.antallSoknader}{" "}
                {ansatt.antallSoknader === 1 ? "søknad" : "søknader"} om
                sykepenger i dette sykefraværet.
              </BodyShort>
              <div className={styles.documentList}>
                {Array.from({ length: ansatt.antallSoknader }, (_, i) => {
                  const totalDager = Math.max(
                    ansatt.antallSoknader,
                    differenceInCalendarDays(
                      new Date(),
                      parseISO(ansatt.forlopStart),
                    ),
                  );
                  const fom = addDays(
                    parseISO(ansatt.forlopStart),
                    Math.floor((i * totalDager) / ansatt.antallSoknader),
                  );
                  const tom = addDays(
                    parseISO(ansatt.forlopStart),
                    Math.floor(((i + 1) * totalDager) / ansatt.antallSoknader) -
                      1,
                  );
                  return (
                    <div className={styles.document} key={iso(fom)}>
                      <div>
                        <strong>Søknad om sykepenger</strong>
                        <BodyShort size="small">
                          {formatDato(iso(fom))} – {formatDato(iso(tom))}
                        </BodyShort>
                      </div>
                      <Detail>Sendt til arbeidsgiver</Detail>
                    </div>
                  );
                }).reverse()}
              </div>
            </>
          )}

          {handling === "se-innkalling" &&
            (ansatt.motebehov?.innkallingDato ? (
              <>
                <div className={styles.meeting}>
                  <HStack gap="space-8" align="center">
                    <Detail>Nav har kalt inn</Detail>
                    {nyeDialogmoter > 0 && (
                      <span className={styles.newBadge}>Ny innkalling</span>
                    )}
                  </HStack>
                  <Heading size="medium" level="3">
                    {formatDato(ansatt.motebehov.innkallingDato)}
                  </Heading>
                  <BodyShort>Kl. 10.00–10.30 · Digitalt møte</BodyShort>
                </div>
                <BodyShort>
                  Du, {fornavn} og veilederen fra Nav går gjennom mulighetene
                  for videre oppfølging.
                </BodyShort>
                <section>
                  <Heading size="small" level="3" spacing>
                    Ta med til møtet
                  </Heading>
                  <ul className={styles.questions}>
                    <li>En oppdatert oppfølgingsplan.</li>
                    <li>Erfaringer med tilretteleggingen dere har prøvd.</li>
                    <li>Spørsmål om hvilken støtte dere trenger videre.</li>
                  </ul>
                  <LinkButton onClick={() => vis("ga-til-plan")}>
                    Finn fram oppfølgingsplanen
                  </LinkButton>
                </section>
              </>
            ) : (
              <BodyShort>
                Det er ingen innkalling fra Nav registrert i dette forløpet. Et
                kommende stoppunkt er ikke en møteavtale.
              </BodyShort>
            ))}

          {handling === "svar-motebehov" &&
            (motebehovBekreftet ? (
              <div className={styles.note} role="status">
                Du har valgt «
                {motebehov === "ja"
                  ? "Ja, vi trenger et møte"
                  : motebehov === "usikker"
                    ? "Jeg ønsker hjelp til å vurdere behovet"
                    : "Nei, vi følger opp videre selv"}
                ».
              </div>
            ) : (
              <>
                {ansatt.motebehov?.besvart && (
                  <div className={styles.note}>
                    Du har allerede svart på spørsmål om møtebehov
                    {ansatt.motebehov.besvartDato
                      ? ` ${formatDato(ansatt.motebehov.besvartDato)}`
                      : ""}
                    .
                  </div>
                )}
                <BodyShort>
                  {erEgetMotebehov
                    ? "Du kan melde behov for et møte med Nav når dere trenger bistand i oppfølgingen."
                    : `Vurder sammen med ${fornavn} om et møte med Nav kan hjelpe dere videre.`}
                </BodyShort>
                <RadioGroup
                  legend={
                    erEgetMotebehov
                      ? "Hva trenger dere?"
                      : "Har dere behov for et møte med Nav?"
                  }
                  value={motebehov}
                  onChange={(value: "ja" | "nei" | "usikker") => {
                    setMotebehov(value);
                    setFeil(null);
                  }}
                  error={feil ?? undefined}
                >
                  <Radio value="ja">
                    {erEgetMotebehov
                      ? "Vi trenger et møte"
                      : "Ja, vi trenger et møte"}
                  </Radio>
                  <Radio value="usikker">
                    Jeg ønsker hjelp til å vurdere behovet
                  </Radio>
                  {!erEgetMotebehov && (
                    <Radio value="nei">Nei, vi følger opp videre selv</Radio>
                  )}
                </RadioGroup>
              </>
            ))}

          {handling === "se-maksdato" &&
            (ansatt.sykepenger ? (
              <>
                <div className={styles.meeting}>
                  <Detail>Siste oppgitte dag med sykepenger</Detail>
                  <Heading size="medium" level="3">
                    {formatDato(ansatt.sykepenger.maksdato)}
                  </Heading>
                  <BodyShort>
                    {ansatt.sykepenger.gjenstaendeDager} sykepengedager gjenstår
                  </BodyShort>
                </div>
                {ansatt.sykepenger.erAnslag && (
                  <BodyShort size="small">
                    Datoen er et anslag og kan endre seg når Nav får nye
                    opplysninger.
                  </BodyShort>
                )}
                <BodyShort>
                  Bruk neste samtale til å avklare hva dere kan prøve videre på
                  arbeidsplassen, og om dere trenger bistand fra Nav.
                </BodyShort>
              </>
            ) : (
              <BodyShort>
                Det er ikke oppgitt noen maksdato for dette forløpet.
              </BodyShort>
            ))}

          {handling === "dialogmoter" && (
            <div className={styles.meetingOverview}>
              {!harSenereOppfolging && dm1Veiledning}
              <section>
                <Detail>Møte med Nav</Detail>
                <HStack gap="space-8" align="center">
                  <Heading size="small" level="3">
                    Dialogmøte 2
                  </Heading>
                </HStack>
                {ansatt.motebehov?.innkallingDato ? (
                  <>
                    <BodyShort>
                      Nav har kalt inn til møte{" "}
                      {formatDato(ansatt.motebehov.innkallingDato)}.
                    </BodyShort>
                    <Button
                      variant="secondary"
                      size="small"
                      onClick={() => vis("se-innkalling")}
                    >
                      Se innkallingen
                    </Button>
                  </>
                ) : (
                  <>
                    <BodyShort>Ingen innkalling registrert her.</BodyShort>
                    <Button
                      variant="tertiary"
                      size="small"
                      onClick={() => vis("svar-motebehov")}
                    >
                      {ansatt.motebehov?.besvart
                        ? "Se eller endre møtebehov"
                        : ansatt.motebehov
                          ? "Svar på møtebehov"
                          : "Meld behov for møte"}
                    </Button>
                  </>
                )}
              </section>
              {harSenereOppfolging && (
                <ReadMore header="Om dialogmøte 1">{dm1Veiledning}</ReadMore>
              )}
            </div>
          )}

          {handling === "beskjeder" && (
            <>
              <BodyShort>
                Beskjeder som gjelder oppfølgingen av {fornavn}.
              </BodyShort>
              <div className={styles.documentList}>
                {ansatt.motebehov?.innkallingDato ? (
                  <div className={styles.message}>
                    <HStack gap="space-8" align="center">
                      <Detail>Fra Nav</Detail>
                      {nyeBeskjeder > 0 && (
                        <span className={styles.newBadge}>Ny</span>
                      )}
                    </HStack>
                    <Heading size="small" level="3">
                      Dere er invitert til dialogmøte 2
                    </Heading>
                    <BodyShort size="small">
                      Møtet er {formatDato(ansatt.motebehov.innkallingDato)}. Se
                      innkallingen og gå gjennom oppfølgingsplanen sammen før
                      møtet.
                    </BodyShort>
                    <Button
                      variant="secondary"
                      size="small"
                      onClick={() => vis("se-innkalling")}
                    >
                      Se innkallingen
                    </Button>
                  </div>
                ) : (
                  <div className={styles.message}>
                    <HStack gap="space-8" align="center">
                      <Detail>Fra Nav</Detail>
                      {nyeBeskjeder > 0 && (
                        <span className={styles.newBadge}>Ny</span>
                      )}
                    </HStack>
                    <Heading size="small" level="3">
                      Hold oppfølgingsplanen oppdatert
                    </Heading>
                    <BodyShort size="small">
                      Bruk planen i samtalene deres. Beskriv hvilke oppgaver som
                      kan tilpasses, hva dere vil prøve, og når dere skal se på
                      resultatet sammen.
                    </BodyShort>
                    <Button
                      variant="secondary"
                      size="small"
                      onClick={() => vis("ga-til-plan")}
                    >
                      Se oppfølgingsplanen
                    </Button>
                  </div>
                )}
              </div>
            </>
          )}

          {handling === "dokumenter" && (
            <div className={styles.documentList}>
              <Button variant="tertiary" onClick={() => vis("ga-til-plan")}>
                Oppfølgingsplan
              </Button>
              <Button variant="tertiary" onClick={() => vis("dialogmoter")}>
                Dialogmøter{nyTekst(nyeDialogmoter)}
              </Button>
              <Button variant="tertiary" onClick={() => vis("sykmeldinger")}>
                Sykmeldinger ({ansatt.antallSykmeldinger})
                {nyTekst(nyeSykmeldinger)}
              </Button>
              <Button variant="tertiary" onClick={() => vis("soknader")}>
                Søknader om sykepenger ({ansatt.antallSoknader})
                {nyTekst(nyeSoknader)}
              </Button>
              <Button variant="tertiary" onClick={() => vis("beskjeder")}>
                Beskjeder fra Nav{nyTekst(nyeBeskjeder)}
              </Button>
            </div>
          )}
        </VStack>
      </Modal.Body>
      <Modal.Footer>
        {handling === "skjul-dm1" && (
          <Button
            onClick={() => {
              settDm1(ansatt.id, { type: "skjult" });
              onClose();
            }}
          >
            Skjul påminnelsen
          </Button>
        )}
        {handling === "vis-dm1" && (
          <Button
            onClick={() => {
              settDm1(ansatt.id, { type: "synlig" });
              onClose();
            }}
          >
            Vis påminnelsen
          </Button>
        )}
        {handling === "svar-motebehov" && !motebehovBekreftet && (
          <Button
            onClick={() => {
              if (!motebehov) setFeil("Velg et svar før du går videre.");
              else {
                settMotebehov(ansatt.id, motebehov);
                setMotebehovBekreftet(true);
              }
            }}
          >
            {erEgetMotebehov ? "Meld behov for møte" : "Bekreft valg"}
          </Button>
        )}
        <Button variant="secondary" onClick={onClose}>
          {handling === "skjul-dm1" ? "Avbryt" : "Lukk"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

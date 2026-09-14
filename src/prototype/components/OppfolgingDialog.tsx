"use client";

import {
  BodyShort,
  Button,
  CopyButton,
  DatePicker,
  Detail,
  Heading,
  HStack,
  Link,
  Modal,
  Radio,
  RadioGroup,
  ReadMore,
  useDatepicker,
  VStack,
} from "@navikt/ds-react";
import {
  addDays,
  differenceInCalendarDays,
  formatISO,
  isValid,
  parseISO,
} from "date-fns";
import { type ReactElement, useState } from "react";
import { usePrototype } from "../state/PrototypeContext";
import type { Ansatt, Dm1Status, Dm1StatusType, HandlingId } from "../types";
import { formatDato } from "../utils/format";
import { dm1StatusTekst } from "../utils/oppfolging";
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
const gyldigDato = (dato: string): boolean =>
  /^\d{4}-\d{2}-\d{2}$/.test(dato) && isValid(parseISO(dato));

const PLANER: Record<
  string,
  { tiltak: string; leder: string; ansatt: string }
> = {
  ada: {
    tiltak:
      "Prøve avgrensede planleggingsoppgaver med færre avbrytelser når det er mulig å være i jobb.",
    leder: "Finne egnede oppgaver og avklare omfanget sammen med Ada.",
    ansatt:
      "Gi tilbakemelding på hvilke oppgaver som fungerer, og hva som bør justeres.",
  },
  emil: {
    tiltak:
      "Fortsette med kortere arbeidsdager og tilpassede oppgaver uten tunge løft.",
    leder:
      "Sørge for en forutsigbar arbeidsplan og fordele de tyngre oppgavene.",
    ansatt: "Prøve oppgavene og si fra om belastningen er passe.",
  },
  noor: {
    tiltak: "Avklare hvordan de første dagene tilbake i jobb skal organiseres.",
    leder:
      "Gå gjennom oppgavene som venter og avtale en kort oppstartssamtale.",
    ansatt: "Si fra hvis det likevel blir behov for tilpasninger.",
  },
  jonas: {
    tiltak:
      "Videreføre avgrensede oppgaver og vurdere om arbeidsmengden passer den avtalte arbeidstiden.",
    leder:
      "Prioritere oppgaver sammen med Jonas og sikre at andre dekker resten.",
    ansatt:
      "Beskrive hva som fungerer og hvilke oppgaver som fortsatt er vanskelige.",
  },
  liv: {
    tiltak:
      "Videreføre korte arbeidsøkter og oppsummere erfaringene før møtet med Nav.",
    leder:
      "Beskrive hvilke tilpasninger som er prøvd, og hva arbeidsplassen kan tilby videre.",
    ansatt: "Forberede erfaringene fra arbeidsøktene og spørsmål til møtet.",
  },
};

const TITLER: Record<DialogHandling, string> = {
  "forbered-dm1": "Forbered dialogmøte 1",
  "registrer-dm1": "Status for dialogmøte 1",
  "endre-dm1": "Status for dialogmøte 1",
  "ga-til-plan": "Oppfølgingsplan",
  "evaluer-plan": "Følg opp planen",
  "avtal-videre": "Avtal neste oppfølging",
  "se-innkalling": "Innkalling til dialogmøte 2",
  "svar-motebehov": "Behov for møte med Nav",
  "se-sykmelding": "Sykmeldinger",
  sykmeldinger: "Sykmeldinger",
  soknader: "Søknader om sykepenger",
  "se-maksdato": "Sykepengedager",
  dokumenter: "Dokumenter",
  beskjeder: "Beskjeder",
  dialogmoter: "Dialogmøter",
};

/** Each opening starts a fresh form; saved information belongs to the employee. */
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
  const {
    dm1For,
    settDm1,
    avtaleFor,
    settAvtale,
    motebehovFor,
    settMotebehov,
  } = usePrototype();
  const status = dm1For(ansatt.id);
  const [handling, setHandling] = useState<DialogHandling>(startHandling);
  const [valg, setValg] = useState<Dm1StatusType>(status.type);
  const [motedato, setMotedato] = useState(
    status.type === "planlagt" || status.type === "gjennomfort"
      ? (status.motedato ?? "")
      : "",
  );
  const [evalueringsdato, setEvalueringsdato] = useState(
    avtaleFor(ansatt.id) ?? "",
  );
  const [feil, setFeil] = useState<string | null>(null);
  const [ugyldigMotedato, setUgyldigMotedato] = useState(false);
  const moteVelger = useDatepicker({
    defaultSelected: motedato ? parseISO(motedato) : undefined,
    fromDate: parseISO(ansatt.forlopStart),
    toDate: valg === "gjennomfort" ? new Date() : undefined,
    onDateChange: (dato) => {
      setMotedato(dato ? iso(dato) : "");
      setFeil(null);
    },
    onValidate: (resultat) =>
      setUgyldigMotedato(!resultat.isEmpty && !resultat.isValidDate),
  });
  const evalueringVelger = useDatepicker({
    defaultSelected: evalueringsdato ? parseISO(evalueringsdato) : undefined,
    fromDate: new Date(),
    onDateChange: (dato) => {
      setEvalueringsdato(dato ? iso(dato) : "");
      setFeil(null);
    },
  });
  const [motebehov, setMotebehov] = useState<"ja" | "nei" | "usikker" | "">(
    motebehovFor(ansatt.id) ?? "",
  );
  const [motebehovBekreftet, setMotebehovBekreftet] = useState(false);
  const fornavn = ansatt.navn.split(" ")[0];
  const iDag = iso(new Date());
  const kjentPlanInnhold =
    ansatt.oppfolgingsplan.status === "delt" && !!PLANER[ansatt.id];
  const plan = PLANER[ansatt.id] ?? {
    tiltak:
      "Avklare om andre oppgaver, arbeidstid eller arbeidssted kan gjøre det mulig å være i jobb.",
    leder: `Finne mulige tilpasninger sammen med ${fornavn}.`,
    ansatt: "Beskrive hva som fungerer, og hvilke oppgaver som er vanskelige.",
  };
  const erStatus = handling === "registrer-dm1" || handling === "endre-dm1";
  const erPlan =
    handling === "ga-til-plan" ||
    handling === "evaluer-plan" ||
    handling === "avtal-videre";

  const vis = (neste: DialogHandling): void => {
    setFeil(null);
    setHandling(neste);
  };

  const lagreStatus = (): void => {
    if ((valg === "planlagt" || valg === "gjennomfort") && ugyldigMotedato) {
      setFeil("Legg inn en gyldig møtedato innenfor dette sykefraværet.");
      return;
    }
    if (valg === "planlagt" && !motedato) {
      setFeil("Legg inn datoen dere har avtalt for møtet.");
      return;
    }
    if ((valg === "planlagt" || valg === "gjennomfort") && motedato) {
      if (!gyldigDato(motedato)) {
        setFeil("Legg inn en gyldig møtedato.");
        return;
      }
      if (motedato < ansatt.forlopStart) {
        setFeil("Møtedatoen må være etter at dette sykefraværet startet.");
        return;
      }
      if (valg === "gjennomfort" && motedato > iDag) {
        setFeil("Et gjennomført møte kan ikke ha en dato fram i tid.");
        return;
      }
    }
    let neste: Dm1Status;
    switch (valg) {
      case "planlagt":
        neste = { type: "planlagt", motedato, registrertDato: iDag };
        break;
      case "gjennomfort":
        neste = {
          type: "gjennomfort",
          motedato: motedato || null,
          registrertDato: iDag,
        };
        break;
      case "vurdert-unodvendig":
        neste = { type: "vurdert-unodvendig", registrertDato: iDag };
        break;
      default:
        neste = { type: "ukjent" };
    }
    settDm1(ansatt.id, neste);
    onClose();
  };

  const lagreAvtale = (): void => {
    if (!gyldigDato(evalueringsdato)) {
      setFeil("Velg en dato for neste oppfølging.");
      return;
    }
    if (evalueringsdato < iDag) {
      setFeil("Velg i dag eller en senere dato for neste oppfølging.");
      return;
    }
    settAvtale(ansatt.id, evalueringsdato);
    onClose();
  };

  const invitasjon = `Hei ${fornavn}!\n\nKan vi avtale en samtale om arbeidshverdagen og mulighetene for tilrettelegging? Dette er dialogmøte 1.\n\nTenk gjerne gjennom hvilke oppgaver som fungerer, hva som er vanskelig, og hva vi kan tilpasse. Vi skal snakke om arbeid og muligheter, ikke diagnose.\n\nMålet er å bli enige om hva vi prøver videre, hvem som gjør hva, og når vi følger opp. Si fra hvilket tidspunkt som passer for deg.`;

  return (
    <Modal
      open
      onClose={onClose}
      width={720}
      header={{ heading: TITLER[handling] }}
    >
      <Modal.Body>
        <VStack gap="space-24">
          <Detail className={styles.person}>
            {ansatt.navn} · {ansatt.orgnavn}
          </Detail>

          {handling === "forbered-dm1" && (
            <>
              <BodyShort>
                Bli enige om hva som kan gjøre det mulig å være i jobb, og hva
                dere prøver videre.
              </BodyShort>
              {status.type === "planlagt" && (
                <div className={styles.note}>
                  Dere har avtalt møte {formatDato(status.motedato)}.
                </div>
              )}
              <section>
                <Heading size="small" level="3" spacing>
                  Tre ting å forberede
                </Heading>
                <ol className={styles.steps}>
                  <li>
                    <strong>Se på oppgavene.</strong>
                    <span>
                      Hva fungerer nå, og hva kan tilpasses i oppgaver,
                      arbeidstid eller arbeidssted?
                    </span>
                  </li>
                  <li>
                    <strong>Ta med den ansattes erfaringer.</strong>
                    <span>
                      Be {fornavn} tenke gjennom hva som fungerer og hva som er
                      vanskelig.
                    </span>
                  </li>
                  <li>
                    <strong>Finn fram oppfølgingsplanen.</strong>
                    <span>
                      Se hva dere har prøvd, og hva dere trenger å avklare
                      sammen.
                    </span>
                  </li>
                </ol>
              </section>
              <ReadMore header="Spørsmål dere kan bruke i møtet">
                <ul className={styles.questions}>
                  <li>Hva har fungert siden sist vi snakket sammen?</li>
                  <li>Hvilken tilpasning kan vi prøve eller justere nå?</li>
                  <li>Hva skal hver av oss gjøre, og når følger vi opp?</li>
                </ul>
                <BodyShort size="small">
                  Skriv avtalen i oppfølgingsplanen. Hold samtalen på arbeid og
                  funksjon; den ansatte trenger ikke dele diagnose.
                </BodyShort>
              </ReadMore>
              {status.type === "ukjent" && (
                <ReadMore header={`Forslag til invitasjon til ${fornavn}`}>
                  <div className={styles.invitation}>{invitasjon}</div>
                  <CopyButton
                    copyText={invitasjon}
                    text="Kopier invitasjon"
                    activeText="Kopiert"
                    size="small"
                  />
                </ReadMore>
              )}
              <ReadMore header="Når er dialogmøte 1 aktuelt?">
                <BodyShort size="small">
                  Ved helt sykefravær skal arbeidsgiver som hovedregel holde
                  møtet innen sju uker, med mindre det er åpenbart unødvendig.
                  Ved gradert sykefravær holdes møtet når arbeidsgiver,
                  arbeidstaker eller sykmelder mener det er behov for det.
                </BodyShort>
                <Link
                  href="https://www.nav.no/arbeidsgiver/oppfolging-sykmeldte"
                  target="_blank"
                  rel="noreferrer"
                  className={styles.source}
                >
                  Les om dialogmøte 1 hos Nav
                </Link>
              </ReadMore>
            </>
          )}

          {erStatus && (
            <>
              <BodyShort>
                Legg inn det dere har avtalt eller gjort. Statusen er din
                opplysning og kan endres senere.
              </BodyShort>
              <RadioGroup
                legend="Hva er status for møtet?"
                value={valg}
                onChange={(value: Dm1StatusType) => {
                  setValg(value);
                  setFeil(null);
                }}
              >
                <Radio value="ukjent">Ingen status registrert her</Radio>
                <Radio value="planlagt">Vi har avtalt et møte</Radio>
                <Radio value="gjennomfort">Vi har gjennomført møtet</Radio>
                <Radio value="vurdert-unodvendig">
                  Jeg vurderer møtet som åpenbart unødvendig
                </Radio>
              </RadioGroup>
              {(valg === "planlagt" || valg === "gjennomfort") && (
                <DatePicker {...moteVelger.datepickerProps}>
                  <DatePicker.Input
                    {...moteVelger.inputProps}
                    label={
                      valg === "planlagt"
                        ? "Avtalt møtedato"
                        : "Når ble møtet holdt? (valgfritt)"
                    }
                    error={feil ?? undefined}
                    description={
                      valg === "gjennomfort"
                        ? "La datoen stå tom hvis du ikke husker den. Vi viser da «gjennomført, dato ikke oppgitt»."
                        : undefined
                    }
                    className={styles.date}
                  />
                </DatePicker>
              )}
              {valg === "vurdert-unodvendig" && (
                <div className={styles.note}>
                  Dette er din vurdering av behovet for møte. Den registreres
                  separat fra gjennomførte møter.
                </div>
              )}
              {status.type !== "ukjent" && (
                <Detail>
                  Forrige registrering: {formatDato(status.registrertDato)}.
                  Dette er datoen statusen ble lagt inn, og kan være en annen
                  enn møtedatoen.
                </Detail>
              )}
            </>
          )}

          {erPlan && (
            <>
              <BodyShort>
                {ansatt.oppfolgingsplan.status === "ingen-i-nav"
                  ? "Det er ingen oppfølgingsplan registrert her. Hvis dere bruker en plan i eget system, oppdater den der dere har den. Neste oppfølging kan dere avtale her."
                  : ansatt.oppfolgingsplan.status === "under-arbeid"
                    ? "Planen er under arbeid. Gå gjennom forslagene sammen før dere blir enige om hva dere skal prøve."
                    : "Bruk planen til å bli enige om ett konkret neste steg og når dere skal se om det fungerer."}
              </BodyShort>
              <div className={styles.plan}>
                <Detail>
                  {kjentPlanInnhold
                    ? "Det dere følger opp i planen"
                    : ansatt.oppfolgingsplan.status === "under-arbeid"
                      ? "Utkast · må avklares sammen"
                      : "Forslag til samtalen · ikke en inngått avtale"}
                </Detail>
                <Heading size="small" level="3">
                  Tilrettelegging og ansvar
                </Heading>
                <dl className={styles.agreements}>
                  <div>
                    <dt>
                      {kjentPlanInnhold
                        ? "Dette prøver vi"
                        : "Dette kan dere prøve"}
                    </dt>
                    <dd>{plan.tiltak}</dd>
                  </div>
                  <div>
                    <dt>Du som leder</dt>
                    <dd>{plan.leder}</dd>
                  </div>
                  <div>
                    <dt>{fornavn}</dt>
                    <dd>{plan.ansatt}</dd>
                  </div>
                </dl>
              </div>
              <section>
                <Heading size="small" level="3" spacing>
                  Når følger dere opp?
                </Heading>
                <BodyShort size="small" spacing>
                  Avtal tidspunktet sammen. Se da på hva som fungerte, og hva
                  dere bør endre.
                </BodyShort>
                <HStack gap="space-8" className={styles.quickDates}>
                  {[7, 14, 28].map((dager) => (
                    <Button
                      key={dager}
                      size="small"
                      variant="secondary"
                      onClick={() => {
                        evalueringVelger.setSelected(
                          addDays(new Date(), dager),
                        );
                        setFeil(null);
                      }}
                    >
                      Om {dager / 7} {dager === 7 ? "uke" : "uker"}
                    </Button>
                  ))}
                </HStack>
                <DatePicker {...evalueringVelger.datepickerProps}>
                  <DatePicker.Input
                    {...evalueringVelger.inputProps}
                    label="Dato for neste oppfølging"
                    error={feil ?? undefined}
                    className={styles.date}
                  />
                </DatePicker>
              </section>
              {ansatt.oppfolgingsplan.sistEndret && (
                <Detail>
                  Oppfølgingsplanen ble sist endret{" "}
                  {formatDato(ansatt.oppfolgingsplan.sistEndret)}.
                </Detail>
              )}
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
                        {ansatt.id === "kai" && index === 0 && (
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
                    {ansatt.id === "liv" && (
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
                  Vurder sammen med {fornavn} om et møte med Nav kan hjelpe dere
                  videre.
                </BodyShort>
                <RadioGroup
                  legend="Har dere behov for et møte med Nav?"
                  value={motebehov}
                  onChange={(value: "ja" | "nei" | "usikker") => {
                    setMotebehov(value);
                    setFeil(null);
                  }}
                  error={feil ?? undefined}
                >
                  <Radio value="ja">Ja, vi trenger et møte</Radio>
                  <Radio value="usikker">
                    Jeg ønsker hjelp til å vurdere behovet
                  </Radio>
                  <Radio value="nei">Nei, vi følger opp videre selv</Radio>
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
              <section>
                <Detail>Du og den ansatte</Detail>
                <Heading size="small" level="3">
                  Dialogmøte 1
                </Heading>
                <BodyShort>{dm1StatusTekst(status)}</BodyShort>
                {status.type !== "ukjent" && (
                  <Detail>
                    Opplysning lagt inn av deg{" "}
                    {formatDato(status.registrertDato)}.
                  </Detail>
                )}
                <HStack gap="space-8">
                  <Button
                    variant="secondary"
                    size="small"
                    onClick={() => vis("endre-dm1")}
                  >
                    {status.type === "ukjent"
                      ? "Legg inn status"
                      : "Endre status"}
                  </Button>
                  {(status.type === "ukjent" || status.type === "planlagt") && (
                    <Button
                      variant="tertiary"
                      size="small"
                      onClick={() => vis("forbered-dm1")}
                    >
                      Forbered møtet
                    </Button>
                  )}
                </HStack>
              </section>
              <section>
                <Detail>Møte med Nav</Detail>
                <HStack gap="space-8" align="center">
                  <Heading size="small" level="3">
                    Dialogmøte 2
                  </Heading>
                  {ansatt.id === "liv" && ansatt.motebehov?.innkallingDato && (
                    <span className={styles.newBadge}>Ny innkalling</span>
                  )}
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
                    {ansatt.motebehov?.besvart ? (
                      <>
                        <Detail>
                          Du har svart på spørsmål om møtebehov
                          {ansatt.motebehov.besvartDato
                            ? ` ${formatDato(ansatt.motebehov.besvartDato)}`
                            : ""}
                          .
                        </Detail>
                        <Button
                          variant="tertiary"
                          size="small"
                          onClick={() => vis("svar-motebehov")}
                        >
                          Se eller endre møtebehov
                        </Button>
                      </>
                    ) : ansatt.motebehov ? (
                      <>
                        <BodyShort size="small">
                          Nav har spurt om dere trenger et møte.
                        </BodyShort>
                        <Button
                          variant="secondary"
                          size="small"
                          onClick={() => vis("svar-motebehov")}
                        >
                          Svar på møtebehov
                        </Button>
                      </>
                    ) : (
                      <Detail>
                        En eventuell innkalling fra Nav vil vises her.
                      </Detail>
                    )}
                  </>
                )}
              </section>
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
                      {ansatt.id === "kai" && (
                        <span className={styles.newBadge}>Ny</span>
                      )}
                    </HStack>
                    <Heading size="small" level="3">
                      Dere er invitert til dialogmøte
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
                      {ansatt.id === "kai" && (
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
              <Button variant="tertiary" onClick={() => vis("sykmeldinger")}>
                Sykmeldinger ({ansatt.antallSykmeldinger})
                {ansatt.id === "kai" ? " · 1 ny" : ""}
              </Button>
              <Button variant="tertiary" onClick={() => vis("soknader")}>
                Søknader om sykepenger ({ansatt.antallSoknader})
              </Button>
              <Button variant="tertiary" onClick={() => vis("ga-til-plan")}>
                Oppfølgingsplan
              </Button>
              <Button variant="tertiary" onClick={() => vis("beskjeder")}>
                Beskjeder{ansatt.id === "kai" ? " · 1 ny" : ""}
              </Button>
              <Button variant="tertiary" onClick={() => vis("dialogmoter")}>
                Dialogmøter{ansatt.id === "liv" ? " · 1 ny innkalling" : ""}
              </Button>
            </div>
          )}
        </VStack>
      </Modal.Body>
      <Modal.Footer>
        {erStatus && <Button onClick={lagreStatus}>Lagre status</Button>}
        {erPlan && (
          <Button onClick={lagreAvtale}>Lagre oppfølgingstidspunkt</Button>
        )}
        {handling === "forbered-dm1" && (
          <Button onClick={() => vis("registrer-dm1")}>
            {status.type === "ukjent"
              ? "Legg inn møtestatus"
              : "Oppdater møtestatus"}
          </Button>
        )}
        {(handling === "se-innkalling" || handling === "se-maksdato") && (
          <Button onClick={() => vis("ga-til-plan")}>
            Se oppfølgingsplanen
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
            Bekreft valg
          </Button>
        )}
        <Button variant="secondary" onClick={onClose}>
          {erStatus || erPlan ? "Avbryt" : "Lukk"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

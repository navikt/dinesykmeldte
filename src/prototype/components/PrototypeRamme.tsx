"use client";

import {
  ArrowCirclepathIcon,
  InformationSquareIcon,
} from "@navikt/aksel-icons";
import { Button, Modal, Select, ToggleGroup } from "@navikt/ds-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { type ReactElement, useEffect, useRef, useState } from "react";
import styles from "../prototype.module.css";
import { usePrototype } from "../state/PrototypeContext";
import type { VariantId } from "../types";

const KONSEPTER = {
  A: {
    navn: "Neste handling",
    grep: "Beholder fellessiden og de utvidbare ansattkortene. Inne i kortet samles oppfølgingen rundt ett neste steg.",
    erstatter:
      "Erstatter rekken av informasjons- og varslingspaneler inne i hvert ansattkort.",
    hypotese:
      "Lederen finner og forbereder riktig neste steg med mindre lesing.",
    omfang: "Minst endring i dagens navigasjon.",
  },
  B: {
    navn: "Forløp og oversikt",
    grep: "Ansattlisten står til venstre. Til høyre samles oppfølgingen i ett forløp, med den aktuelle hendelsen åpen.",
    erstatter:
      "Erstatter den lange listen med åpne ansattkort med et samlet arbeidsområde på fellessiden.",
    hypotese:
      "Lederen forstår både hva som er aktuelt og sammenhengen med det som har skjedd og kommer.",
    omfang:
      "Utforsker forløp som ramme rundt eksisterende hendelser og dialogmøte 1. Ingen retning er valgt.",
  },
  C: {
    navn: "Oppgaver på tvers",
    grep: "Starter med det lederen trenger å følge opp på tvers av ansatte. En oppgave kan åpnes direkte; navnet åpner forløpet fra B.",
    erstatter:
      "Erstatter inngangen «ansatte med varslinger» med en oversikt over aktuelle steg på tvers av ansatte. Dokumenter er fortsatt tilgjengelige.",
    hypotese:
      "Ledere med flere sykmeldte finner det som trenger oppmerksomhet, enten det er et dialogmøte, et spørsmål fra Nav eller oppfølging av planen.",
    omfang: "Et valg om oversikten, som kan kombineres med B.",
  },
};

export function PrototypeRamme({
  children,
}: {
  children: ReactElement;
}): ReactElement {
  const {
    variant,
    setVariant,
    employeeCount,
    setEmployeeCount,
    antallEndringer,
  } = usePrototype();
  const [om, setOm] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialisert = useRef(false);
  useEffect(() => {
    if (initialisert.current) return;
    initialisert.current = true;
    const valgt = searchParams.get("variant");
    if (valgt === "A" || valgt === "B" || valgt === "C") setVariant(valgt);
    const antall = Number(searchParams.get("ansatte"));
    if (antall === 1 || antall === 6 || antall === 25) setEmployeeCount(antall);
  }, [searchParams, setVariant, setEmployeeCount]);
  const byttVariant = (v: string) => {
    setVariant(v as VariantId);
    const params = new URLSearchParams(searchParams.toString());
    params.set("variant", v);
    router.replace(`?${params}`, { scroll: false });
  };
  const konsept = KONSEPTER[variant];
  return (
    <div className={styles.shell} data-oppfolging-prototype>
      <div className={styles.demoBar}>
        <div className={styles.demoLabel}>
          <span className={styles.demoDot} /> Demo · fiktive data
        </div>
        <ToggleGroup
          label="Konsept"
          size="small"
          value={variant}
          onChange={byttVariant}
        >
          <ToggleGroup.Item value="A">A · Neste handling</ToggleGroup.Item>
          <ToggleGroup.Item value="B">B · Forløp</ToggleGroup.Item>
          <ToggleGroup.Item value="C">C · Arbeidsoversikt</ToggleGroup.Item>
        </ToggleGroup>
        <Select
          label="Antall ansatte i demoen"
          hideLabel
          size="small"
          value={employeeCount}
          onChange={(e) => {
            const n = Number(e.target.value) as 1 | 6 | 25;
            setEmployeeCount(n);
            const params = new URLSearchParams(searchParams.toString());
            params.set("ansatte", String(n));
            router.replace(`?${params}`, { scroll: false });
          }}
        >
          <option value="1">1 ansatt</option>
          <option value="6">6 ansatte</option>
          <option value="25">25 ansatte</option>
        </Select>
        <Button
          variant="tertiary"
          size="small"
          icon={<InformationSquareIcon aria-hidden />}
          onClick={() => setOm(true)}
        >
          Om konseptet
        </Button>
      </div>
      {children}
      <Modal
        open={om}
        onClose={() => setOm(false)}
        header={{ heading: `${variant} · ${konsept.navn}` }}
        width="medium"
      >
        <Modal.Body>
          <div className={styles.conceptBody}>
            <p className={styles.lead}>{konsept.grep}</p>
            <div>
              <h3>Hva endres fra dagens løsning?</h3>
              <p>{konsept.erstatter}</p>
              <Link href="/" target="_blank">
                Åpne dagens demo i en ny fane
              </Link>
            </div>
            <div>
              <h3>Dette vil vi lære</h3>
              <p>{konsept.hypotese}</p>
              <p className={styles.muted}>
                Undersøk om lederen forstår ansvaret, når møtet skal holdes og
                hvordan det kan forberedes. Klikk og skjulte påminnelser viser
                ikke om dialogmøte 1 er gjennomført.
              </p>
            </div>
            <div className={styles.conceptNote}>
              <strong>Mulig avgrensning</strong>
              <p>{konsept.omfang}</p>
            </div>
            <details>
              <summary>Hvordan kan dette prøves i en A/B-test?</summary>
              <p>
                Kontrollgruppen beholder dagens fellesside. Testgruppen får den
                valgte strukturen på samme inngang. Dokumenter og beskjeder
                følger med; nye oppgaver samles i arbeidsflaten. Denne demoen
                viser utformingen med fiktive ansatte. Den fordeler ingen reelle
                brukere i et eksperiment.
              </p>
              <p>
                Dialogmøte 1 inngår som én hendelse i sykefraværsoppfølgingen.
                Det som er relevant for den ansatte løftes fram, uavhengig av
                hendelsestype. A og B er alternative strukturer; C viser neste
                steg på tvers av ansatte. Oppfølgingsplanen håndterer fortsatt
                tiltak, avtaler og evaluering i sin egen tjeneste.
              </p>
            </details>
            <div className={styles.conceptNote}>
              <h3>Veiledning og påminnelse</h3>
              <p>
                Demoen ber ikke lederen rapportere møtedato, gjennomføring eller
                unntak til Nav. «Skjul påminnelsen» endrer bare visningen i
                minnet og kan angres. Det betyr ikke at møteplikten er oppfylt.
              </p>
              <p>
                Før en virkelig løsning må formål og behandlingsgrunnlag for
                eventuell personknyttet lagring og måling avklares. En annen
                knappetekst løser ikke dette alene.
              </p>
            </div>
            <div className={styles.scenarioControls}>
              <h3>Prøv ulike ansatte</h3>
              <p>
                Velg en ansatt på fellessiden. Ada viser helt fravær, Emil
                delvis fravær og Noor en skjult påminnelse. Jonas og Liv viser
                senere oppfølging med Nav og maksdato. Kai har passert sju uker.
                Vis 25 ansatte for å prøve et større utvalg.
              </p>
              <Button
                variant="secondary"
                size="small"
                icon={<ArrowCirclepathIcon aria-hidden />}
                onClick={() => window.location.reload()}
              >
                Nullstill demoen{antallEndringer ? ` (${antallEndringer})` : ""}
              </Button>
              <p className={styles.muted}>
                Endringer gjelder bare i denne demoøkten. Siden sender ikke inn
                møtestatus. Last inn siden på nytt for å starte på nytt.
              </p>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={() => setOm(false)}>Prøv konseptet</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

"use client";

import {
  ArrowCirclepathIcon,
  InformationSquareIcon,
} from "@navikt/aksel-icons";
import { Button, Modal, Select, ToggleGroup } from "@navikt/ds-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { type ReactElement, useEffect, useRef, useState } from "react";
import { SCENARIER } from "../data/scenarier";
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
    omfang: "Ny struktur på fellessiden. Anbefalt hovedspor å utforske.",
  },
  C: {
    navn: "Oppgaver på tvers",
    grep: "Starter med det lederen trenger å følge opp på tvers av ansatte. En oppgave kan åpnes direkte; navnet åpner forløpet fra B.",
    erstatter:
      "Erstatter inngangen «ansatte med varslinger» med en arbeidsoversikt. Alle ansatte og dokumenter er fortsatt tilgjengelige.",
    hypotese:
      "Ledere med flere sykmeldte prioriterer raskere og kommer rett til riktig oppgave.",
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
    scenario,
    setScenarioId,
    nullstill,
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
                Se om lederen finner riktig oppgave, forstår tidspunktet og
                fullfører uten hjelp. Registrert møtestatus alene måler ikke
                bedre oppfølging.
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
                Start med tidlig oppfølging og dialogmøte 1. Senere hendelser
                viser hvordan løsningen kan henge sammen over tid. A og B er
                alternative strukturer; C er et ekstra valg om prioritering på
                tvers.
              </p>
            </details>
            <div className={styles.scenarioControls}>
              <h3>Prøv en bestemt situasjon</h3>
              <Select
                label="Situasjon i demoen"
                size="small"
                value={scenario.id}
                onChange={(e) => setScenarioId(e.target.value)}
              >
                {SCENARIER.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.navn}
                  </option>
                ))}
              </Select>
              <p className={styles.muted}>{scenario.laeringspoeng}</p>
              <Button
                variant="secondary"
                size="small"
                icon={<ArrowCirclepathIcon aria-hidden />}
                onClick={nullstill}
              >
                Nullstill endringer
                {antallEndringer ? ` (${antallEndringer})` : ""}
              </Button>
              <p className={styles.muted}>
                Endringer gjelder bare i denne demoøkten. Ingenting sendes eller
                varsles. Bytte av situasjon nullstiller endringene; bytte av
                konsept bevarer dem.
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

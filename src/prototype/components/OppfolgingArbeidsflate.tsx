"use client";

import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CalendarIcon,
  CheckmarkIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  FileTextIcon,
  PersonGroupIcon,
} from "@navikt/aksel-icons";
import { Button, Search, Select } from "@navikt/ds-react";
import { useEffect, useState } from "react";
import styles from "../prototype.module.css";
import { usePrototype } from "../state/PrototypeContext";
import type { AktueltNa, Ansatt, Hendelse } from "../types";
import { formatDato, formatDatoKort } from "../utils/format";
import {
  dm1StatusEtikett,
  gjeldendePeriode,
  ukerISykefravaer,
  utledAktueltNa,
  utledTidslinje,
} from "../utils/oppfolging";
import { type DialogHandling, OppfolgingDialog } from "./OppfolgingDialog";

type Filter = "alle" | "na" | "kommende" | "avventer";
type OpenAction = (ansatt: Ansatt, handling: DialogHandling) => void;
const FILTER_NAVN: Record<Filter, string> = {
  alle: "Alle ansatte",
  na: "Aktuelt nå",
  kommende: "Kommende",
  avventer: "Ingen oppgave nå",
};
const nyeDokumenter = (ansatt: Ansatt) =>
  ansatt.id === "kai" ? 2 : ansatt.id === "liv" ? 1 : 0;
const dokumentTekst = (ansatt: Ansatt) =>
  nyeDokumenter(ansatt) === 1
    ? "1 nytt dokument"
    : `${nyeDokumenter(ansatt)} nye dokumenter`;

function kortOppgave(aktuelt: AktueltNa) {
  if (aktuelt.kategori === "avventer") return aktuelt.tittel;
  const id = aktuelt.handling.id;
  if (id === "forbered-dm1" || id === "registrer-dm1" || id === "endre-dm1")
    return "Dialogmøte 1";
  if (id === "se-innkalling") return "Dialogmøte 2";
  if (id === "avtal-videre" || aktuelt.hendelseId === "plan-evaluering")
    return "Evaluering av planen";
  return "Oppfølgingsplan";
}

function Tidspunkt({ aktuelt }: { aktuelt: AktueltNa }) {
  return (
    <span className={styles.dateLabel}>
      {aktuelt.fristDato && <CalendarIcon aria-hidden />}
      {aktuelt.fristDato
        ? formatDatoKort(aktuelt.fristDato)
        : aktuelt.handling.id === "avtal-videre"
          ? "Avtal tidspunkt"
          : "—"}
    </span>
  );
}

function AnsattMeta({ ansatt }: { ansatt: Ansatt }) {
  const periode = gjeldendePeriode(ansatt);
  return (
    <span className={styles.employeeMeta}>
      {periode.grad} % sykmeldt <span aria-hidden>·</span>{" "}
      {ukerISykefravaer(ansatt)} uker
    </span>
  );
}

function NesteHandling({
  ansatt,
  onAction,
}: {
  ansatt: Ansatt;
  onAction: OpenAction;
}) {
  const { dm1For, avtaleFor } = usePrototype();
  const dm1 = dm1For(ansatt.id);
  const aktuelt = utledAktueltNa(ansatt, dm1, avtaleFor(ansatt.id));
  return (
    <div className={styles.nextAction} data-category={aktuelt.kategori}>
      <div className={styles.actionEyebrow}>
        <span>
          {aktuelt.kategori === "avventer"
            ? "Til orientering"
            : aktuelt.kategori === "kommende"
              ? "Neste avtale"
              : "Aktuelt nå"}
        </span>
        <Tidspunkt aktuelt={aktuelt} />
      </div>
      <h3>{aktuelt.tittel}</h3>
      <p>{aktuelt.beskrivelse}</p>
      <div className={styles.actionButtons}>
        <Button
          size="small"
          variant={aktuelt.kategori === "avventer" ? "secondary" : "primary"}
          onClick={() => onAction(ansatt, aktuelt.handling.id)}
          icon={<ArrowRightIcon aria-hidden />}
          iconPosition="right"
        >
          {aktuelt.handling.tekst}
        </Button>
        {aktuelt.handling.id === "forbered-dm1" && (
          <Button
            size="small"
            variant="tertiary"
            onClick={() => onAction(ansatt, "endre-dm1")}
          >
            {dm1.type === "ukjent" ? "Allerede avklart?" : "Endre møtestatus"}
          </Button>
        )}
      </div>
    </div>
  );
}

function Dokumenter({
  ansatt,
  onAction,
  compact = false,
}: {
  ansatt: Ansatt;
  onAction: OpenAction;
  compact?: boolean;
}) {
  const dokumenter: {
    tittel: string;
    detalj: string;
    handling: DialogHandling;
  }[] = [
    {
      tittel: "Sykmeldinger",
      detalj: `${ansatt.antallSykmeldinger} ${ansatt.antallSykmeldinger === 1 ? "sykmelding" : "sykmeldinger"}`,
      handling: "sykmeldinger",
    },
    {
      tittel: "Søknader",
      detalj: `${ansatt.antallSoknader} ${ansatt.antallSoknader === 1 ? "søknad" : "søknader"}`,
      handling: "soknader",
    },
    {
      tittel: "Oppfølgingsplan",
      detalj:
        ansatt.oppfolgingsplan.status === "delt"
          ? "Delt med Nav"
          : ansatt.oppfolgingsplan.status === "under-arbeid"
            ? "Under arbeid"
            : "Ikke registrert i Nav",
      handling: "ga-til-plan",
    },
    {
      tittel: "Dialogmøter",
      detalj: ansatt.motebehov?.innkallingDato
        ? "Innkalling fra Nav"
        : "Møter og møtebehov",
      handling: "dialogmoter",
    },
    { tittel: "Beskjeder", detalj: "Fra Nav", handling: "beskjeder" },
  ];
  return (
    <nav
      className={compact ? styles.documentLinks : styles.documents}
      aria-label={`Dokumenter for ${ansatt.navn}`}
    >
      {dokumenter.map((d) => (
        <button
          key={d.handling}
          type="button"
          className={styles.documentButton}
          onClick={() => onAction(ansatt, d.handling)}
        >
          <FileTextIcon aria-hidden />
          <span>
            <strong>
              {d.tittel}
              {((ansatt.id === "kai" &&
                (d.handling === "sykmeldinger" ||
                  d.handling === "beskjeder")) ||
                (ansatt.id === "liv" && d.handling === "dialogmoter")) && (
                <span className={styles.count}>Ny</span>
              )}
            </strong>
            {!compact && <small>{d.detalj}</small>}
          </span>
          {!compact && <ChevronRightIcon aria-hidden />}
        </button>
      ))}
    </nav>
  );
}

const STATUS_NAVN = {
  gjennomfort: "Registrert",
  planlagt: "Avtalt",
  ukjent: "Status ikke lagt inn",
  forventet: "Veiledende tidspunkt",
  vurdert: "Din vurdering",
};

function Hendelsesrad({
  hendelse,
  ansatt,
  onAction,
}: {
  hendelse: Hendelse;
  ansatt: Ansatt;
  onAction: OpenAction;
}) {
  return (
    <li className={styles.timelineItem} data-state={hendelse.status}>
      <span className={styles.timelineDot}>
        {hendelse.status === "gjennomfort" && <CheckmarkIcon aria-hidden />}
      </span>
      <div>
        <div className={styles.eventHeading}>
          <strong>{hendelse.tittel}</strong>
          <span>
            {hendelse.datoTekst ??
              (hendelse.dato
                ? formatDatoKort(hendelse.dato)
                : "Dato ikke oppgitt")}
          </span>
        </div>
        <small>
          {hendelse.kilde === "leder" && hendelse.status === "gjennomfort"
            ? "Oppgitt av deg"
            : STATUS_NAVN[hendelse.status]}
        </small>
        <details className={styles.eventDetails}>
          <summary>Se detaljer</summary>
          <p>{hendelse.beskrivelse}</p>
          {hendelse.presisering && (
            <p className={styles.muted}>{hendelse.presisering}</p>
          )}
          {hendelse.handling && (
            <Button
              size="small"
              variant="tertiary"
              onClick={() => {
                if (hendelse.handling) onAction(ansatt, hendelse.handling.id);
              }}
            >
              {hendelse.handling.tekst}
            </Button>
          )}
        </details>
      </div>
    </li>
  );
}

function Forlop({
  ansatt,
  onAction,
}: {
  ansatt: Ansatt;
  onAction: OpenAction;
}) {
  const { dm1For, avtaleFor } = usePrototype();
  const dm1 = dm1For(ansatt.id);
  const avtale = avtaleFor(ansatt.id);
  const aktuelt = utledAktueltNa(ansatt, dm1, avtale);
  const hendelser = utledTidslinje(ansatt, dm1, avtale);
  const historikk = hendelser.filter(
    (h) => h.status === "gjennomfort" || h.status === "vurdert",
  );
  const fremover = hendelser.filter(
    (h) => !historikk.includes(h) && h.id !== aktuelt.hendelseId,
  );
  const aktiv = hendelser.find((h) => h.id === aktuelt.hendelseId);
  return (
    <div className={styles.timeline}>
      {historikk.length > 0 && (
        <details className={styles.history} key={`${ansatt.id}-historikk`}>
          <summary>
            <CheckmarkIcon aria-hidden />
            Tidligere i forløpet <span>{historikk.length} hendelser</span>
            <ChevronDownIcon aria-hidden />
          </summary>
          <ol className={styles.timelineList}>
            {historikk.map((h) => (
              <Hendelsesrad
                key={h.id}
                hendelse={h}
                ansatt={ansatt}
                onAction={onAction}
              />
            ))}
          </ol>
        </details>
      )}
      <div className={styles.currentEvent}>
        <span className={styles.currentDot} />
        <NesteHandling ansatt={ansatt} onAction={onAction} />
        {aktiv?.id === "dm1" && (
          <div className={styles.currentStatus}>
            {dm1StatusEtikett(dm1)}
            {dm1.type === "gjennomfort" &&
              !dm1.motedato &&
              " · møtedato ikke oppgitt"}
          </div>
        )}
      </div>
      {fremover.length > 0 && (
        <>
          <p className={styles.upcomingLabel}>Videre i oppfølgingen</p>
          <ol className={styles.timelineList}>
            {fremover.map((h) => (
              <Hendelsesrad
                key={h.id}
                hendelse={h}
                ansatt={ansatt}
                onAction={onAction}
              />
            ))}
          </ol>
        </>
      )}
    </div>
  );
}

function AnsattArbeidsomrade({
  ansatt,
  onAction,
  onBack,
}: {
  ansatt: Ansatt;
  onAction: OpenAction;
  onBack?: () => void;
}) {
  const [fane, setFane] = useState<"oppfolging" | "dokumenter">("oppfolging");
  const periode = gjeldendePeriode(ansatt);
  return (
    <section
      className={styles.detailPanel}
      aria-label={`Oppfølging av ${ansatt.navn}`}
    >
      {onBack && (
        <Button
          size="small"
          variant="tertiary"
          icon={<ArrowLeftIcon aria-hidden />}
          onClick={onBack}
        >
          Til arbeidsoversikten
        </Button>
      )}
      <div className={styles.detailHeader}>
        <div>
          <h2>{ansatt.navn}</h2>
          <AnsattMeta ansatt={ansatt} />
        </div>
        <details className={styles.personInfo}>
          <summary>Om den ansatte</summary>
          <dl>
            <dt>Virksomhet</dt>
            <dd>{ansatt.orgnavn}</dd>
            <dt>Fødselsnummer</dt>
            <dd>{ansatt.fnrMaskert}</dd>
            <dt>Nåværende sykmelding</dt>
            <dd>
              {formatDatoKort(periode.fom)}–{formatDatoKort(periode.tom)}
            </dd>
            <dt>Forløpet startet</dt>
            <dd>{formatDato(ansatt.forlopStart)}</dd>
          </dl>
        </details>
      </div>
      {ansatt.sykepenger && ansatt.sykepenger.gjenstaendeDager < 90 && (
        <button
          type="button"
          className={styles.benefitStrip}
          onClick={() => onAction(ansatt, "se-maksdato")}
        >
          <CalendarIcon aria-hidden />
          {ansatt.sykepenger.gjenstaendeDager} sykepengedager igjen · maksdato{" "}
          {formatDatoKort(ansatt.sykepenger.maksdato)}
          <ChevronRightIcon aria-hidden />
        </button>
      )}
      <div
        className={styles.detailTabs}
        role="tablist"
        aria-label={`Visning for ${ansatt.navn}`}
      >
        <button
          type="button"
          role="tab"
          aria-selected={fane === "oppfolging"}
          aria-controls={`innhold-${ansatt.id}`}
          onClick={() => setFane("oppfolging")}
        >
          Oppfølging
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={fane === "dokumenter"}
          aria-controls={`innhold-${ansatt.id}`}
          onClick={() => setFane("dokumenter")}
        >
          Dokumenter og beskjeder
          {nyeDokumenter(ansatt) > 0 && (
            <span className={styles.count}>{nyeDokumenter(ansatt)} nye</span>
          )}
        </button>
      </div>
      <div
        id={`innhold-${ansatt.id}`}
        role="tabpanel"
        aria-label={
          fane === "oppfolging" ? "Oppfølging" : "Dokumenter og beskjeder"
        }
        className={styles.detailBody}
      >
        {fane === "oppfolging" ? (
          <Forlop ansatt={ansatt} onAction={onAction} />
        ) : (
          <Dokumenter ansatt={ansatt} onAction={onAction} />
        )}
      </div>
    </section>
  );
}

function AnsattKort({
  ansatt,
  open,
  onToggle,
  onAction,
}: {
  ansatt: Ansatt;
  open: boolean;
  onToggle: () => void;
  onAction: OpenAction;
}) {
  const { dm1For, avtaleFor } = usePrototype();
  const aktuelt = utledAktueltNa(
    ansatt,
    dm1For(ansatt.id),
    avtaleFor(ansatt.id),
  );
  return (
    <section className={styles.employeeCard} data-open={open}>
      <button
        type="button"
        className={styles.cardHeader}
        aria-expanded={open}
        aria-controls={`kort-${ansatt.id}`}
        onClick={onToggle}
      >
        <span className={styles.avatar}>
          {ansatt.navn
            .split(" ")
            .map((n) => n[0])
            .join("")}
        </span>
        <span className={styles.cardIdentity}>
          <strong>{ansatt.navn}</strong>
          <AnsattMeta ansatt={ansatt} />
          {nyeDokumenter(ansatt) > 0 && (
            <span className={styles.newDocuments}>{dokumentTekst(ansatt)}</span>
          )}
        </span>
        <span className={styles.cardTask}>
          <span className={styles.taskDot} data-category={aktuelt.kategori} />
          {kortOppgave(aktuelt)}
        </span>
        <Tidspunkt aktuelt={aktuelt} />
        <ChevronDownIcon aria-hidden className={open ? styles.rotated : ""} />
      </button>
      {open && (
        <div id={`kort-${ansatt.id}`} className={styles.cardContent}>
          <div>
            <NesteHandling ansatt={ansatt} onAction={onAction} />
            <button
              type="button"
              className={styles.inlineStatus}
              onClick={() => onAction(ansatt, "endre-dm1")}
            >
              Dialogmøte 1: {dm1StatusEtikett(dm1For(ansatt.id))}
              <span>Endre</span>
            </button>
          </div>
          <div className={styles.cardDocuments}>
            <div className={styles.documentsHeading}>
              <strong>Dokumenter og beskjeder</strong>
              {nyeDokumenter(ansatt) > 0 && (
                <span className={styles.count}>
                  {nyeDokumenter(ansatt)} nye
                </span>
              )}
            </div>
            <Dokumenter ansatt={ansatt} onAction={onAction} compact />
          </div>
        </div>
      )}
    </section>
  );
}

export function OppfolgingArbeidsflate() {
  const {
    variant,
    ansatte,
    fokusAnsatt,
    setFokusAnsattId,
    dm1For,
    avtaleFor,
    scenario,
    employeeCount,
  } = usePrototype();
  const [sok, setSok] = useState("");
  const [virksomhet, setVirksomhet] = useState("alle");
  const [filter, setFilter] = useState<Filter>("alle");
  const [aOpen, setAOpen] = useState(true);
  const [cDetalj, setCDetalj] = useState(false);
  const [dialog, setDialog] = useState<{
    ansatt: Ansatt;
    handling: DialogHandling;
  } | null>(null);
  useEffect(() => {
    if (!scenario.id || !employeeCount) return;
    setSok("");
    setFilter("alle");
    setVirksomhet("alle");
    setAOpen(true);
    setCDetalj(false);
  }, [scenario.id, employeeCount]);
  const oppgave = (ansatt: Ansatt) =>
    utledAktueltNa(ansatt, dm1For(ansatt.id), avtaleFor(ansatt.id));
  const grunnlag = ansatte.filter(
    (a) =>
      (virksomhet === "alle" || a.orgnummer === virksomhet) &&
      a.navn.toLocaleLowerCase("nb").includes(sok.toLocaleLowerCase("nb")),
  );
  const synlige = grunnlag.filter(
    (a) => filter === "alle" || oppgave(a).kategori === filter,
  );
  const valgt = synlige.find((a) => a.id === fokusAnsatt.id) ?? synlige[0];
  useEffect(() => {
    if (valgt && valgt.id !== fokusAnsatt.id) setFokusAnsattId(valgt.id);
  }, [valgt, fokusAnsatt.id, setFokusAnsattId]);
  const antallAktuelle = grunnlag.filter(
    (a) => oppgave(a).kategori === "na",
  ).length;
  const onAction: OpenAction = (ansatt, handling) =>
    setDialog({ ansatt, handling });
  const velg = (ansatt: Ansatt) => {
    setFokusAnsattId(ansatt.id);
    setAOpen(true);
  };
  const virksomheter = Array.from(
    new Map(ansatte.map((a) => [a.orgnummer, a.orgnavn])).entries(),
  );
  const sortert = [...synlige].sort((a, b) => {
    const x = oppgave(a);
    const y = oppgave(b);
    const p = { na: 0, kommende: 1, avventer: 2 };
    return (
      p[x.kategori] - p[y.kategori] ||
      (x.fristDato ?? "9999").localeCompare(y.fristDato ?? "9999") ||
      a.navn.localeCompare(b.navn, "nb")
    );
  });

  return (
    <div className={styles.product}>
      <div className={styles.pageHeader}>
        <div className={styles.pageTitle}>
          <div className={styles.pageIcon}>
            <PersonGroupIcon aria-hidden />
          </div>
          <div>
            <h1>Dine sykmeldte</h1>
            <p>Oversikt og oppfølging av ansatte du har ansvar for</p>
          </div>
        </div>
        <Select
          label="Virksomhet"
          size="small"
          value={virksomhet}
          onChange={(e) => setVirksomhet(e.target.value)}
        >
          <option value="alle">Alle virksomheter</option>
          {virksomheter.map(([id, navn]) => (
            <option key={id} value={id}>
              {navn}
            </option>
          ))}
        </Select>
      </div>
      <div className={styles.overviewLine}>
        <span>
          <strong>{grunnlag.length}</strong>{" "}
          {grunnlag.length === 1 ? "ansatt" : "ansatte"}
        </span>
        <span>
          <span className={styles.taskDot} />
          <strong>{antallAktuelle}</strong> med aktuell oppfølging
        </span>
        <span className={styles.muted}>
          Nye dokumenter vises hos den ansatte
        </span>
      </div>
      <div className={styles.listToolbar}>
        <fieldset className={styles.filters} aria-label="Filtrer ansatte">
          {(Object.keys(FILTER_NAVN) as Filter[]).map((f) => (
            <button
              key={f}
              type="button"
              aria-pressed={filter === f}
              onClick={() => {
                setFilter(f);
                setCDetalj(false);
              }}
            >
              {FILTER_NAVN[f]}
              <span>
                {f === "alle"
                  ? grunnlag.length
                  : grunnlag.filter((a) => oppgave(a).kategori === f).length}
              </span>
            </button>
          ))}
        </fieldset>
        <Search
          label="Søk etter ansatt"
          hideLabel
          variant="simple"
          size="small"
          value={sok}
          onChange={setSok}
          placeholder="Søk etter ansatt"
        />
      </div>
      {synlige.length === 0 ? (
        <div className={styles.empty}>
          <PersonGroupIcon aria-hidden />
          <h2>Ingen ansatte i dette utvalget</h2>
          <p>Prøv et annet navn eller vis alle ansatte.</p>
          <Button
            size="small"
            variant="secondary"
            onClick={() => {
              setSok("");
              setFilter("alle");
              setVirksomhet("alle");
            }}
          >
            Vis alle ansatte
          </Button>
        </div>
      ) : variant === "A" ? (
        <div className={styles.cardList}>
          {synlige.map((a) => (
            <AnsattKort
              key={a.id}
              ansatt={a}
              open={valgt?.id === a.id && aOpen}
              onToggle={() => {
                if (valgt?.id === a.id) setAOpen(!aOpen);
                else velg(a);
              }}
              onAction={onAction}
            />
          ))}
        </div>
      ) : variant === "B" || cDetalj ? (
        <div className={styles.workspace}>
          <nav className={styles.employeeNav} aria-label="Velg ansatt">
            <div className={styles.employeeNavHeading}>
              Ansatte <span>{synlige.length}</span>
            </div>
            {synlige.map((a) => {
              const task = oppgave(a);
              return (
                <button
                  key={a.id}
                  type="button"
                  aria-current={valgt?.id === a.id ? "true" : undefined}
                  onClick={() => velg(a)}
                >
                  <div className={styles.employeeNavName}>
                    <strong>{a.navn}</strong>
                    <ChevronRightIcon aria-hidden />
                  </div>
                  <AnsattMeta ansatt={a} />
                  <span className={styles.employeeNavTask}>
                    <span
                      className={styles.taskDot}
                      data-category={task.kategori}
                    />
                    {kortOppgave(task)}
                  </span>
                  {nyeDokumenter(a) > 0 && (
                    <span className={styles.newDocuments}>
                      {dokumentTekst(a)}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
          {valgt && (
            <AnsattArbeidsomrade
              key={valgt.id}
              ansatt={valgt}
              onAction={onAction}
              onBack={variant === "C" ? () => setCDetalj(false) : undefined}
            />
          )}
        </div>
      ) : (
        <div className={styles.taskOverview}>
          <div className={styles.tableIntro}>
            <h2>Arbeidsoversikt</h2>
            <p>
              Oppfølging som er aktuell nå vises først. Deretter kommende
              avtaler og løpende oppfølging.
            </p>
          </div>
          <table className={styles.taskTable}>
            <thead>
              <tr>
                <th>Ansatt</th>
                <th>Neste steg</th>
                <th>Tidspunkt</th>
                <th>
                  <span className={styles.srOnly}>Handling</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {sortert.map((a) => {
                const task = oppgave(a);
                return (
                  <tr key={a.id}>
                    <td>
                      <button
                        type="button"
                        className={styles.nameLink}
                        onClick={() => {
                          velg(a);
                          setCDetalj(true);
                        }}
                      >
                        {a.navn}
                      </button>
                      <AnsattMeta ansatt={a} />
                      {nyeDokumenter(a) > 0 && (
                        <button
                          type="button"
                          className={styles.documentNotice}
                          onClick={() => onAction(a, "dokumenter")}
                        >
                          {dokumentTekst(a)}
                        </button>
                      )}
                    </td>
                    <td>
                      <span className={styles.tableTask}>
                        <span
                          className={styles.taskDot}
                          data-category={task.kategori}
                        />
                        {task.tittel}
                      </span>
                      <small>
                        {task.kategori === "avventer"
                          ? "Ingen oppgave nå"
                          : task.kategori === "kommende"
                            ? "Kommende avtale"
                            : "Aktuelt nå"}
                      </small>
                    </td>
                    <td>
                      <Tidspunkt aktuelt={task} />
                    </td>
                    <td>
                      <Button
                        size="small"
                        variant="secondary"
                        onClick={() => onAction(a, task.handling.id)}
                      >
                        {task.handling.tekst}
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      <div className={styles.pageFoot}>
        <span>Oppfølgingen skjer i dialog med den ansatte.</span>
        <a
          href="https://www.nav.no/arbeidsgiver/oppfolging-sykmeldte"
          target="_blank"
          rel="noreferrer"
        >
          Veiledning om sykefraværsoppfølging
        </a>
      </div>
      {dialog && (
        <OppfolgingDialog
          key={`${dialog.ansatt.id}-${dialog.handling}`}
          ansatt={dialog.ansatt}
          handling={dialog.handling}
          onClose={() => setDialog(null)}
        />
      )}
    </div>
  );
}

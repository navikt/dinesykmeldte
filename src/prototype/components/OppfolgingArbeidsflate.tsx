"use client";

import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CalendarIcon,
  Chat2Icon,
  CheckmarkIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  ClipboardIcon,
  ClockIcon,
  FileTextIcon,
  PersonGroupIcon,
} from "@navikt/aksel-icons";
import { Alert, Button, Search, Select } from "@navikt/ds-react";
import { useEffect, useState } from "react";
import styles from "../prototype.module.css";
import { usePrototype } from "../state/PrototypeContext";
import type { AktueltNa, Ansatt, Hendelse } from "../types";
import { formatDatoKort } from "../utils/format";
import {
  dagerTil,
  erFortid,
  gjeldendePeriode,
  ukerISykefravaer,
  utledAktuelleHendelser,
  utledAktueltNa,
  utledTidslinje,
} from "../utils/oppfolging";
import { OmAnsatt } from "./OmAnsatt";
import { type DialogHandling, OppfolgingDialog } from "./OppfolgingDialog";

type Filter = "alle" | "na" | "kommende" | "avventer";
type OpenAction = (ansatt: Ansatt, handling: DialogHandling) => void;
const FILTER_NAVN: Record<Filter, string> = {
  alle: "Alle ansatte",
  na: "Aktuelt nå",
  kommende: "Kommende",
  avventer: "Til orientering",
};
const nyeDokumenter = (ansatt: Ansatt): number =>
  Object.values(ansatt.nyeDokumenter ?? {}).reduce(
    (sum, antall) => sum + antall,
    0,
  );
const dokumentTekst = (ansatt: Ansatt) =>
  nyeDokumenter(ansatt) === 1
    ? "1 nytt dokument"
    : `${nyeDokumenter(ansatt)} nye dokumenter`;

function kortOppgave(aktuelt: AktueltNa) {
  if (aktuelt.hendelseId !== "dm1") return aktuelt.tittel;
  if (aktuelt.kategori === "avventer")
    return "Dialogmøte 1 · påminnelse skjult";
  if (!aktuelt.fristDato) return "Vurder behovet for dialogmøte 1";
  return "Dialogmøte 1 innen sju uker";
}

function Tidspunkt({ aktuelt }: { aktuelt: AktueltNa }) {
  return (
    <span className={styles.dateLabel}>
      {aktuelt.fristDato && <CalendarIcon aria-hidden />}
      {aktuelt.fristDato
        ? `${aktuelt.datoEtikett ?? "Frist"} ${formatDatoKort(aktuelt.fristDato)}`
        : aktuelt.kategori === "avventer"
          ? "—"
          : aktuelt.hendelseId === "dm1"
            ? "Ved behov"
            : ""}
    </span>
  );
}

function AnsattMeta({
  ansatt,
  visVirksomhet = false,
}: {
  ansatt: Ansatt;
  visVirksomhet?: boolean;
}) {
  const periode = gjeldendePeriode(ansatt);
  return (
    <>
      <span className={styles.employeeMeta}>
        {periode.grad} % sykmeldt <span aria-hidden>·</span>{" "}
        {ukerISykefravaer(ansatt)} uker
      </span>
      {visVirksomhet && (
        <span className={styles.employeeOrg}>{ansatt.orgnavn}</span>
      )}
    </>
  );
}

function NesteHandling({
  ansatt,
  onAction,
}: {
  ansatt: Ansatt;
  onAction: OpenAction;
}) {
  const { dm1For } = usePrototype();
  const dm1 = dm1For(ansatt.id);
  const aktuelt = utledAktueltNa(ansatt, dm1);
  const erDm1 = aktuelt.hendelseId === "dm1";
  return (
    <div className={styles.nextAction} data-category={aktuelt.kategori}>
      <div className={styles.actionEyebrow}>
        <span>
          {aktuelt.kategori === "avventer"
            ? "Til orientering"
            : aktuelt.kategori === "kommende"
              ? "Kommende"
              : "Aktuelt nå"}
        </span>
        <Tidspunkt aktuelt={aktuelt} />
      </div>
      <h3>{aktuelt.tittel}</h3>
      <p>{aktuelt.beskrivelse}</p>
      {erDm1 && aktuelt.fristDato && dagerTil(aktuelt.fristDato) < 0 && (
        <p className={styles.actionPurpose}>
          Nav vet ikke om møtet er gjennomført.
        </p>
      )}
      {erDm1 && dm1.type === "synlig" && (
        <p className={styles.actionPurpose}>
          Snakk sammen om arbeidsoppgaver og tilrettelegging. Du inviterer og
          leder møtet. Avklar med den ansatte om lege eller annen sykmelder skal
          delta.
        </p>
      )}
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
        {erDm1 &&
          (dm1.type === "synlig" ? (
            <Button
              size="small"
              variant="tertiary"
              onClick={() => onAction(ansatt, "skjul-dm1")}
            >
              Skjul påminnelsen
            </Button>
          ) : (
            <Button
              size="small"
              variant="tertiary"
              onClick={() => onAction(ansatt, "forbered-dm1")}
            >
              Les om dialogmøte 1
            </Button>
          ))}
      </div>
    </div>
  );
}

function TjenesterOgDokumenter({
  ansatt,
  onAction,
  compact = false,
}: {
  ansatt: Ansatt;
  onAction: OpenAction;
  compact?: boolean;
}) {
  const grupper: {
    tittel: string;
    lenker: {
      tittel: string;
      detalj: string;
      handling: DialogHandling;
      antallNye?: number;
      ikon: typeof FileTextIcon;
    }[];
  }[] = [
    {
      tittel: "Plan og møter",
      lenker: [
        {
          tittel: "Oppfølgingsplan",
          detalj:
            ansatt.oppfolgingsplan.status === "delt"
              ? "Åpne eller oppdater planen · Delt med Nav"
              : ansatt.oppfolgingsplan.status === "under-arbeid"
                ? "Fortsett med planen · Under arbeid"
                : "Lag en oppfølgingsplan",
          handling: "ga-til-plan",
          antallNye: ansatt.nyeDokumenter?.oppfolgingsplan,
          ikon: ClipboardIcon,
        },
        {
          tittel: "Dialogmøter",
          detalj: "Be om møte med Nav, svar på møtebehov eller se innkallinger",
          handling: "dialogmoter",
          antallNye: ansatt.nyeDokumenter?.dialogmoter,
          ikon: Chat2Icon,
        },
      ],
    },
    {
      tittel: "Dokumenter og beskjeder",
      lenker: [
        {
          tittel: "Sykmeldinger",
          detalj: `${ansatt.antallSykmeldinger} ${ansatt.antallSykmeldinger === 1 ? "sykmelding" : "sykmeldinger"}`,
          handling: "sykmeldinger",
          antallNye: ansatt.nyeDokumenter?.sykmeldinger,
          ikon: FileTextIcon,
        },
        {
          tittel: "Søknader om sykepenger",
          detalj: `${ansatt.antallSoknader} ${ansatt.antallSoknader === 1 ? "søknad" : "søknader"}`,
          handling: "soknader",
          antallNye: ansatt.nyeDokumenter?.soknader,
          ikon: FileTextIcon,
        },
        {
          tittel: "Beskjeder fra Nav",
          detalj: "Les beskjeder om oppfølgingen",
          handling: "beskjeder",
          antallNye: ansatt.nyeDokumenter?.beskjeder,
          ikon: Chat2Icon,
        },
      ],
    },
  ];
  return (
    <nav
      className={compact ? styles.documentLinks : styles.documents}
      aria-label={`Tjenester og dokumenter for ${ansatt.navn}`}
    >
      {grupper.map((gruppe) => (
        <div key={gruppe.tittel} className={styles.serviceGroup}>
          {!compact && <h3>{gruppe.tittel}</h3>}
          {gruppe.lenker.map((lenke) => (
            <button
              key={lenke.handling}
              type="button"
              className={styles.documentButton}
              onClick={() => onAction(ansatt, lenke.handling)}
            >
              <lenke.ikon aria-hidden />
              <span>
                <strong>
                  {lenke.tittel}
                  {!!lenke.antallNye && (
                    <span className={styles.count}>
                      {lenke.antallNye === 1 ? "Ny" : `${lenke.antallNye} nye`}
                    </span>
                  )}
                </strong>
                {!compact && <small>{lenke.detalj}</small>}
              </span>
              {!compact && <ChevronRightIcon aria-hidden />}
            </button>
          ))}
        </div>
      ))}
    </nav>
  );
}

const STATUS_NAVN = {
  gjennomfort: "Registrert",
  planlagt: "Avtalt",
  ukjent: "Status ikke kjent for Nav",
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

function AndreHendelser({
  ansatt,
  onAction,
}: {
  ansatt: Ansatt;
  onAction: OpenAction;
}) {
  const { dm1For } = usePrototype();
  const aktuelle = utledAktuelleHendelser(ansatt, dm1For(ansatt.id));
  const andre = aktuelle.slice(1).filter((h) => h.kategori === "na");
  if (andre.length === 0) return null;
  return (
    <div className={styles.otherEvents}>
      <h4>Også aktuelt</h4>
      {andre.map((h) => (
        <div key={h.hendelseId}>
          <span>
            <strong>{h.tittel}</strong>
            {h.hendelseId === "maksdato" && ansatt.sykepenger && (
              <small>
                {ansatt.sykepenger.gjenstaendeDager} sykepengedager igjen
              </small>
            )}
            <Tidspunkt aktuelt={h} />
          </span>
          <div className={styles.otherEventActions}>
            <Button
              size="small"
              variant="tertiary"
              onClick={() => onAction(ansatt, h.handling.id)}
            >
              {h.hendelseId === "dm1" ? "Se veiledning" : h.handling.tekst}
            </Button>
            {h.hendelseId === "dm1" && (
              <Button
                size="small"
                variant="tertiary"
                onClick={() => onAction(ansatt, "skjul-dm1")}
              >
                Skjul påminnelsen
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function Forlop({
  ansatt,
  onAction,
}: {
  ansatt: Ansatt;
  onAction: OpenAction;
}) {
  const { dm1For } = usePrototype();
  const dm1 = dm1For(ansatt.id);
  const aktuelt = utledAktueltNa(ansatt, dm1);
  const hendelser = utledTidslinje(ansatt, dm1);
  const aktiveIder = utledAktuelleHendelser(ansatt, dm1)
    .filter((h) => h.kategori === "na")
    .map((h) => h.hendelseId);
  const historikk = hendelser.filter(
    (h) =>
      h.id !== aktuelt.hendelseId &&
      !aktiveIder.includes(h.id) &&
      (erFortid(h) || h.status === "gjennomfort"),
  );
  const fremover = hendelser.filter(
    (h) =>
      !historikk.includes(h) &&
      h.id !== aktuelt.hendelseId &&
      !aktiveIder.includes(h.id),
  );
  return (
    <div className={styles.timeline}>
      {historikk.length > 0 && (
        <details className={styles.history} key={`${ansatt.id}-historikk`}>
          <summary>
            <ClockIcon aria-hidden />
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
        <AndreHendelser ansatt={ansatt} onAction={onAction} />
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
  onRemove,
}: {
  ansatt: Ansatt;
  onAction: OpenAction;
  onBack?: () => void;
  onRemove: (ansatt: Ansatt) => void;
}) {
  const [fane, setFane] = useState<"oppfolging" | "dokumenter">("oppfolging");
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
      </div>
      <OmAnsatt ansatt={ansatt} onRemove={onRemove} />

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
          Forløp
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={fane === "dokumenter"}
          aria-controls={`innhold-${ansatt.id}`}
          onClick={() => setFane("dokumenter")}
        >
          Tjenester og dokumenter
          {nyeDokumenter(ansatt) > 0 && (
            <span className={styles.count}>
              {nyeDokumenter(ansatt)}{" "}
              {nyeDokumenter(ansatt) === 1 ? "nytt" : "nye"}
            </span>
          )}
        </button>
      </div>
      <div
        id={`innhold-${ansatt.id}`}
        role="tabpanel"
        aria-label={
          fane === "oppfolging" ? "Forløp" : "Tjenester og dokumenter"
        }
        className={styles.detailBody}
      >
        {fane === "oppfolging" ? (
          <Forlop ansatt={ansatt} onAction={onAction} />
        ) : (
          <TjenesterOgDokumenter ansatt={ansatt} onAction={onAction} />
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
  onRemove,
  visVirksomhet,
}: {
  ansatt: Ansatt;
  open: boolean;
  onToggle: () => void;
  onAction: OpenAction;
  onRemove: (ansatt: Ansatt) => void;
  visVirksomhet: boolean;
}) {
  const { dm1For } = usePrototype();
  const aktuelt = utledAktueltNa(ansatt, dm1For(ansatt.id));
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
          <AnsattMeta ansatt={ansatt} visVirksomhet={visVirksomhet && !open} />
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
          <div className={styles.cardFacts}>
            <OmAnsatt ansatt={ansatt} onRemove={onRemove} />
          </div>
          <div>
            <NesteHandling ansatt={ansatt} onAction={onAction} />
            <AndreHendelser ansatt={ansatt} onAction={onAction} />
            {dm1For(ansatt.id).type === "skjult" &&
              aktuelt.hendelseId !== "dm1" &&
              ansatt.dm1Relevans !== "passert-fase" && (
                <Button
                  size="small"
                  variant="tertiary"
                  onClick={() => onAction(ansatt, "vis-dm1")}
                >
                  Vis påminnelsen om dialogmøte 1 igjen
                </Button>
              )}
          </div>
          <div className={styles.cardDocuments}>
            <div className={styles.documentsHeading}>
              <strong>Tjenester og dokumenter</strong>
              {nyeDokumenter(ansatt) > 0 && (
                <span className={styles.count}>
                  {nyeDokumenter(ansatt)}{" "}
                  {nyeDokumenter(ansatt) === 1 ? "nytt" : "nye"}
                </span>
              )}
            </div>
            <TjenesterOgDokumenter
              ansatt={ansatt}
              onAction={onAction}
              compact
            />
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
    settDm1,
    employeeCount,
  } = usePrototype();
  const [fjernede, setFjernede] = useState<string[]>([]);
  const [sistFjernet, setSistFjernet] = useState<Ansatt | null>(null);
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
    if (!employeeCount) return;
    setSok("");
    setFilter("alle");
    setVirksomhet("alle");
    setAOpen(true);
    setCDetalj(false);
  }, [employeeCount]);
  const oppgave = (ansatt: Ansatt) => utledAktueltNa(ansatt, dm1For(ansatt.id));
  const kategori = (ansatt: Ansatt): AktueltNa["kategori"] =>
    nyeDokumenter(ansatt) > 0 ? "na" : oppgave(ansatt).kategori;
  const tilgjengelige = ansatte.filter((a) => !fjernede.includes(a.id));
  const iVirksomhet = tilgjengelige.filter(
    (a) => virksomhet === "alle" || a.orgnummer === virksomhet,
  );
  const visSok = iVirksomhet.length >= 5 || sok.length > 0;
  const visArbeidsflate = variant === "B" || (variant === "C" && cDetalj);
  const visVirksomhet = new Set(iVirksomhet.map((a) => a.orgnummer)).size > 1;
  const grunnlag = iVirksomhet.filter((a) =>
    a.navn.toLocaleLowerCase("nb").includes(sok.trim().toLocaleLowerCase("nb")),
  );
  const synlige = grunnlag.filter(
    (a) => filter === "alle" || kategori(a) === filter,
  );
  const valgt = synlige.find((a) => a.id === fokusAnsatt.id) ?? synlige[0];
  useEffect(() => {
    if (valgt && valgt.id !== fokusAnsatt.id) setFokusAnsattId(valgt.id);
  }, [valgt, fokusAnsatt.id, setFokusAnsattId]);
  const antallAktuelle = grunnlag.filter((a) => kategori(a) === "na").length;
  const onAction: OpenAction = (ansatt, handling) => {
    if (handling === "vis-dm1") {
      settDm1(ansatt.id, { type: "synlig" });
      return;
    }
    setDialog({ ansatt, handling });
  };
  const fjernAnsatt = (ansatt: Ansatt) => {
    setFjernede((ids) => [...ids, ansatt.id]);
    setSistFjernet(ansatt);
    setDialog(null);
    setAOpen(true);
  };
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
      p[kategori(a)] - p[kategori(b)] ||
      (x.fristDato ?? "9999").localeCompare(y.fristDato ?? "9999") ||
      a.navn.localeCompare(b.navn, "nb")
    );
  });

  const sokefelt = (
    <Search
      label="Søk etter ansatt"
      hideLabel
      variant="simple"
      size="small"
      value={sok}
      onChange={setSok}
      placeholder="Søk etter ansatt"
    />
  );
  const tomtUtvalg = (
    <div className={styles.empty}>
      <PersonGroupIcon aria-hidden />
      <h2>
        {iVirksomhet.length === 0
          ? "Ingen ansatte i oversikten"
          : "Ingen ansatte i dette utvalget"}
      </h2>
      <p>
        {iVirksomhet.length === 0
          ? "Du har ingen ansatte å følge opp i det valgte virksomhetsutvalget."
          : "Prøv et annet navn eller vis alle ansatte i virksomhetsutvalget."}
      </p>
      {iVirksomhet.length > 0 && (
        <Button
          size="small"
          variant="secondary"
          onClick={() => {
            setSok("");
            setFilter("alle");
          }}
        >
          Nullstill søk og filter
        </Button>
      )}
      {iVirksomhet.length === 0 && virksomhet !== "alle" && (
        <Button
          size="small"
          variant="secondary"
          onClick={() => {
            setVirksomhet("alle");
            setSok("");
            setFilter("alle");
          }}
        >
          Vis alle virksomheter
        </Button>
      )}
    </div>
  );

  return (
    <div className={styles.product}>
      <div className={styles.pageHeader}>
        <div className={styles.pageTitle}>
          <div className={styles.pageIcon}>
            <PersonGroupIcon aria-hidden />
          </div>
          <div>
            <h1>Dine sykmeldte</h1>
            <p>Oppfølging og dokumenter for ansatte du følger opp</p>
          </div>
        </div>
        <Select
          label="Virksomhet"
          size="small"
          value={virksomhet}
          onChange={(e) => {
            setVirksomhet(e.target.value);
            setSok("");
            setFilter("alle");
          }}
        >
          <option value="alle">Alle virksomheter</option>
          {virksomheter.map(([id, navn]) => (
            <option key={id} value={id}>
              {navn}
            </option>
          ))}
        </Select>
      </div>
      {sistFjernet && (
        <Alert
          variant="success"
          size="small"
          className={styles.removalNotice}
          role="status"
        >
          {sistFjernet.navn} er fjernet fra din oversikt for{" "}
          {sistFjernet.orgnavn}.
        </Alert>
      )}
      <div className={styles.overviewLine}>
        <span>
          <strong>{grunnlag.length}</strong>{" "}
          {grunnlag.length === 1 ? "ansatt" : "ansatte"}
        </span>
        <span>
          <span className={styles.taskDot} />
          <strong>{antallAktuelle}</strong> med noe aktuelt nå
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
                  : grunnlag.filter((a) => kategori(a) === f).length}
              </span>
            </button>
          ))}
        </fieldset>
      </div>
      {!visArbeidsflate && visSok && (
        <div className={styles.listSearch}>{sokefelt}</div>
      )}
      {synlige.length === 0 && !visArbeidsflate ? (
        tomtUtvalg
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
              onRemove={fjernAnsatt}
              visVirksomhet={visVirksomhet}
            />
          ))}
        </div>
      ) : visArbeidsflate ? (
        <div className={styles.workspace}>
          <nav className={styles.employeeNav} aria-label="Velg ansatt">
            <div className={styles.employeeNavTools}>
              <div className={styles.employeeNavHeading}>
                Ansatte <span>{synlige.length}</span>
              </div>
              {visSok && (
                <div className={styles.employeeSearch}>{sokefelt}</div>
              )}
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
                  <AnsattMeta ansatt={a} visVirksomhet={visVirksomhet} />
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
              onRemove={fjernAnsatt}
              onBack={variant === "C" ? () => setCDetalj(false) : undefined}
            />
          )}
          {!valgt && (
            <div>
              {variant === "C" && (
                <Button
                  size="small"
                  variant="tertiary"
                  icon={<ArrowLeftIcon aria-hidden />}
                  onClick={() => setCDetalj(false)}
                >
                  Til arbeidsoversikten
                </Button>
              )}
              {tomtUtvalg}
            </div>
          )}
        </div>
      ) : (
        <div className={styles.taskOverview}>
          <div className={styles.tableIntro}>
            <h2>Oppfølging på tvers av ansatte</h2>
            <p>
              Det som er aktuelt nå vises først. Velg en ansatt for å se hele
              forløpet og dokumentene.
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
                      <AnsattMeta ansatt={a} visVirksomhet={visVirksomhet} />
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
                        {kortOppgave(task)}
                      </span>
                      {utledAktuelleHendelser(a, dm1For(a.id)).length > 1 && (
                        <button
                          type="button"
                          className={styles.documentNotice}
                          onClick={() => {
                            velg(a);
                            setCDetalj(true);
                          }}
                        >
                          Se også:{" "}
                          {utledAktuelleHendelser(a, dm1For(a.id))
                            .slice(1)
                            .map((h) => h.tittel)
                            .join(", ")}
                        </button>
                      )}
                      <small>
                        {task.kategori === "avventer"
                          ? "Til orientering"
                          : task.kategori === "kommende"
                            ? "Kommer senere"
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
                      {dm1For(a.id).type === "skjult" &&
                        task.hendelseId !== "dm1" &&
                        a.dm1Relevans !== "passert-fase" && (
                          <Button
                            size="small"
                            variant="tertiary"
                            onClick={() => onAction(a, "vis-dm1")}
                          >
                            Vis påminnelsen om dialogmøte 1 igjen
                          </Button>
                        )}
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

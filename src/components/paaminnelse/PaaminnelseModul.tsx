import { InformationSquareIcon } from "@navikt/aksel-icons";
import {
  BodyLong,
  Button,
  HStack,
  InfoCard,
  LocalAlert,
  VStack,
} from "@navikt/ds-react";
import { type ReactElement, useEffect, useMemo, useState } from "react";
import type { SykmeldingFragment } from "../../graphql/queries/graphql.generated";
import {
  type PaaminnelseStatus,
  PaaminnelseStatusSchema,
} from "../../services/paaminnelse/paaminnelseContract";
import {
  OPPFOLGINGSPLAN_TILTAKSPAKKE_1,
  type Tiltakspakkevurderinger,
  TiltakspakkevurderingerSchema,
} from "../../services/tiltakspakke/tiltakspakkevurderingContract";
import { browserEnv } from "../../utils/env";

// Appen kjører under et basePath i deployede miljøer. Klient-fetch må derfor
// prefikses, slik som apollo.ts, Lumi.tsx og hendelseUtils.ts.
const BASE_PATH = browserEnv.publicPath ?? "";

type VisiblePaaminnelseStatus = Exclude<PaaminnelseStatus["status"], "SKJULT">;
type ModulState =
  | { status: "LOADING" }
  | { status: "HIDDEN" }
  | {
      status: "VISIBLE";
      paaminnelseStatus: VisiblePaaminnelseStatus;
      synligFra: string;
    };
type Action = "bestill" | "avbestill";

type Props = {
  readonly narmestelederId: string;
  readonly orgnummer: string;
  readonly sykmeldingPerioder: SykmeldingFragment["perioder"];
};

const PAAMINNELSE_HEADING_ID = "paaminnelse-oppfolgingsplan-heading";

export default function PaaminnelseModul({
  narmestelederId,
  orgnummer,
  sykmeldingPerioder,
}: Props): ReactElement | null {
  const [modulState, setModulState] = useState<ModulState>({
    status: "LOADING",
  });
  const [pendingAction, setPendingAction] = useState<Action | null>(null);
  const [actionError, setActionError] = useState<Action | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Stabil primitiv dep i stedet for selve perioder-arrayet: Apollo kan gi en ny
  // array-referanse (f.eks. når sykmeldingen markeres som lest ved mount) uten at
  // den tidligste fom-en endrer seg. Uten dette ville effekten kjørt på nytt,
  // satt LOADING og dermed avmontert hele kortet og hentet begge endepunkter på
  // nytt — en synlig flikk for det vanlige tilfellet.
  const tidligsteFom = useMemo(
    () => finnTidligsteFom(sykmeldingPerioder),
    [sykmeldingPerioder],
  );

  useEffect(() => {
    const abortController = new AbortController();

    setModulState({ status: "LOADING" });
    setActionError(null);

    void loadInitialState({
      narmestelederId,
      orgnummer,
      signal: abortController.signal,
      tidligsteFom,
    })
      .then((nextState) => {
        if (!abortController.signal.aborted) {
          setModulState(nextState);
        }
      })
      .catch(() => {
        if (!abortController.signal.aborted) {
          setModulState({ status: "HIDDEN" });
        }
      });

    return () => abortController.abort();
  }, [narmestelederId, orgnummer, tidligsteFom]);

  // Default-deny: vis ingenting før begge gatene er løst (LOADING) og når
  // resultatet er skjul (HIDDEN). Et synlig, merket lastekort ville blinket
  // påminnelsens eksistens til flertallet som ender skjult.
  if (modulState.status === "LOADING" || modulState.status === "HIDDEN") {
    return null;
  }

  const isBestilt = modulState.paaminnelseStatus === "BESTILT";
  const action: Action = isBestilt ? "avbestill" : "bestill";

  const feilmelding = actionError && (
    <LocalAlert status="error" size="small" as="div">
      <LocalAlert.Header>
        <LocalAlert.Title as="h3">
          {actionError === "bestill"
            ? "Vi kunne ikke bestille påminnelsen"
            : "Vi kunne ikke avbestille påminnelsen"}
        </LocalAlert.Title>
      </LocalAlert.Header>
      <LocalAlert.Content>
        Prøv igjen om litt. Hvis feilen fortsetter, kan du gå videre uten å
        gjøre noe her.
      </LocalAlert.Content>
    </LocalAlert>
  );

  const handlingsknapp = (
    <HStack gap="space-8" wrap>
      <Button
        loading={pendingAction === action}
        size="small"
        variant={isBestilt ? "tertiary" : "primary"}
        onClick={() => {
          void handleAction(action);
        }}
      >
        {isBestilt ? "Skru av påminnelsen" : "Ja, minn meg på det"}
      </Button>
    </HStack>
  );

  return (
    <section
      // Ikke-bestilt: InfoCard er en <div>, så wrapper-seksjonen navngis av
      // tittelen og blir en ren landmark. Bestilt: LocalAlert rendrer sin egen
      // navngitte <section>, så vi lar wrapperen være unavngitt (ikke en
      // landmark) for å unngå nøstede, navngitte regioner.
      aria-labelledby={isBestilt ? undefined : PAAMINNELSE_HEADING_ID}
      className="mt-10 mb-6 max-w-2xl"
    >
      <span role="status" className="sr-only">
        {statusMessage ?? ""}
      </span>
      {isBestilt ? (
        // Bestilt-tilstand: grønn suksess-variant (LocalAlert). LocalAlert
        // setter ikke role="alert" selv (roten er en navngitt <section>), så
        // den sr-only status-regionen over eier annonseringen ved handling.
        <LocalAlert status="success">
          <LocalAlert.Header>
            <LocalAlert.Title as="h2">Du vil få en påminnelse</LocalAlert.Title>
          </LocalAlert.Header>
          <LocalAlert.Content>
            <VStack gap="space-24">
              <BodyLong size="small">
                Dersom du ikke allerede har sendt inn en plan, får du påminnelse
                på e-post når fristen nærmer seg.
              </BodyLong>
              {feilmelding}
              {handlingsknapp}
            </VStack>
          </LocalAlert.Content>
        </LocalAlert>
      ) : (
        <InfoCard data-color="info">
          <InfoCard.Header icon={<InformationSquareIcon aria-hidden />}>
            <InfoCard.Title as="h2" id={PAAMINNELSE_HEADING_ID}>
              Start oppfølging tidlig
            </InfoCard.Title>
          </InfoCard.Header>
          <InfoCard.Content>
            <VStack gap="space-24">
              <VStack gap="space-20">
                <BodyLong size="small">
                  Som nærmeste leder er din oppfølging ofte avgjørende for hvor
                  raskt den ansatte kommer tilbake. Start med en tidlig samtale.
                </BodyLong>
                <BodyLong size="small">
                  Som hovedregel har du ansvar for at dere lager en
                  oppfølgingsplan innen 4 uker. Målet er å finne ut om noen
                  arbeidsoppgaver er mulig å gjøre i sykmeldingsperioden.
                </BodyLong>
                <BodyLong size="small" weight="semibold">
                  Vil du ha en påminnelse på e-post når fristen for å lage en
                  plan nærmer seg?
                </BodyLong>
              </VStack>
              {feilmelding}
              {handlingsknapp}
            </VStack>
          </InfoCard.Content>
        </InfoCard>
      )}
    </section>
  );

  async function handleAction(actionToRun: Action): Promise<void> {
    setPendingAction(actionToRun);
    setActionError(null);

    try {
      const nextStatus = await updatePaaminnelseStatus(
        narmestelederId,
        actionToRun,
      );
      // Dagens skrivekontrakt svarer kun med status (POST→BESTILT, DELETE→
      // TILGJENGELIG) og utelater `synligFra`. Per-sykmelding-synligheten ble
      // allerede avgjort da modulen ble VISIBLE, så vi beholder den `synligFra`
      // for å unngå at boksen forsvinner rett etter en handling. Returnerer
      // backend en ekte `synligFra` senere, brukes den i stedet. Returnerer
      // skrivingen SKJULT, skjules boksen riktig (fail-safe).
      const nextStatusForCurrentSykmelding =
        nextStatus.status !== "SKJULT" &&
        nextStatus.synligFra == null &&
        modulState.status === "VISIBLE"
          ? { ...nextStatus, synligFra: modulState.synligFra }
          : nextStatus;

      setModulState(toModulState(nextStatusForCurrentSykmelding, tidligsteFom));

      // Bestilt-varselet (LocalAlert med role="alert") annonserer seg selv, så
      // vi lar det ta bestillingen. Avbestilling går tilbake til InfoCard uten
      // alert-rolle, så den annonseres via den sr-only status-regionen. Slik
      // unngår vi dobbelt-annonsering ved bestilling.
      if (nextStatusForCurrentSykmelding.status !== "SKJULT") {
        setStatusMessage(
          actionToRun === "avbestill"
            ? "Påminnelse om oppfølgingsplan avbestilt"
            : null,
        );
      }
    } catch {
      setActionError(actionToRun);
    } finally {
      setPendingAction(null);
    }
  }
}

async function loadInitialState({
  narmestelederId,
  orgnummer,
  signal,
  tidligsteFom,
}: {
  readonly narmestelederId: string;
  readonly orgnummer: string;
  readonly signal: AbortSignal;
  readonly tidligsteFom: string | null;
}): Promise<ModulState> {
  if (!narmestelederId || !orgnummer) {
    return { status: "HIDDEN" };
  }

  const [tiltakspakkevurderinger, paaminnelseStatus] = await Promise.all([
    fetchTiltakspakkevurderinger(signal),
    fetchPaaminnelseStatus(narmestelederId, signal),
  ]);

  if (!isTiltaksgruppeForOrgnummer(tiltakspakkevurderinger, orgnummer)) {
    return { status: "HIDDEN" };
  }

  return toModulState(paaminnelseStatus, tidligsteFom);
}

function toModulState(
  paaminnelseStatus: PaaminnelseStatus,
  tidligsteFom: string | null,
): ModulState {
  const synligFra = paaminnelseStatus.synligFra;

  if (
    paaminnelseStatus.status === "SKJULT" ||
    synligFra == null ||
    !isSykmeldingInnenforPaaminnelseperiode(tidligsteFom, synligFra)
  ) {
    return { status: "HIDDEN" };
  }

  return {
    status: "VISIBLE",
    paaminnelseStatus: paaminnelseStatus.status,
    synligFra,
  };
}

async function fetchTiltakspakkevurderinger(
  signal: AbortSignal,
): Promise<Tiltakspakkevurderinger> {
  const json = await fetchJson(`${BASE_PATH}/api/tiltakspakkevurdering`, {
    method: "GET",
    signal,
  });

  return TiltakspakkevurderingerSchema.parse(json);
}

async function fetchPaaminnelseStatus(
  narmestelederId: string,
  signal: AbortSignal,
): Promise<PaaminnelseStatus> {
  const json = await fetchJson(getPaaminnelsePath(narmestelederId), {
    method: "GET",
    signal,
  });

  return PaaminnelseStatusSchema.parse(json);
}

async function updatePaaminnelseStatus(
  narmestelederId: string,
  action: Action,
): Promise<PaaminnelseStatus> {
  const json = await fetchJson(getPaaminnelsePath(narmestelederId), {
    method: action === "bestill" ? "POST" : "DELETE",
    headers: action === "bestill" ? { "Content-Type": "application/json" } : {},
    body: action === "bestill" ? JSON.stringify({}) : undefined,
  });

  return PaaminnelseStatusSchema.parse(json);
}

async function fetchJson(input: string, init: RequestInit): Promise<unknown> {
  const response = await fetch(input, init);

  if (!response.ok) {
    throw new Error("Påminnelse-kall feilet");
  }

  return await response.json();
}

function getPaaminnelsePath(narmestelederId: string): string {
  return `${BASE_PATH}/api/paaminnelse/${encodeURIComponent(narmestelederId)}`;
}

function isTiltaksgruppeForOrgnummer(
  vurderinger: Tiltakspakkevurderinger,
  orgnummer: string,
): boolean {
  return vurderinger.some(
    (vurdering) =>
      vurdering.tiltakspakkeId === OPPFOLGINGSPLAN_TILTAKSPAKKE_1 &&
      vurdering.virksomheter.some(
        (virksomhet) =>
          virksomhet.orgnummer === orgnummer &&
          virksomhet.deltakelse === "TILTAKSGRUPPE",
      ),
  );
}

function finnTidligsteFom(
  perioder: SykmeldingFragment["perioder"],
): string | null {
  return (
    perioder
      .map((periode) => periode.fom)
      .sort((left, right) => left.localeCompare(right))[0] ?? null
  );
}

function isSykmeldingInnenforPaaminnelseperiode(
  tidligsteFom: string | null,
  synligFra: string,
): boolean {
  return tidligsteFom != null && tidligsteFom >= synligFra;
}

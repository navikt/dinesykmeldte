import {
  BodyLong,
  Button,
  HStack,
  InfoCard,
  LocalAlert,
  VStack,
} from "@navikt/ds-react";
import { type ReactElement, useEffect, useState } from "react";
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

  useEffect(() => {
    const abortController = new AbortController();

    setModulState({ status: "LOADING" });
    setActionError(null);

    void loadInitialState({
      narmestelederId,
      orgnummer,
      signal: abortController.signal,
      sykmeldingPerioder,
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
  }, [narmestelederId, orgnummer, sykmeldingPerioder]);

  // Default-deny: vis ingenting før begge gatene er løst (LOADING) og når
  // resultatet er skjul (HIDDEN). Et synlig, merket lastekort ville blinket
  // påminnelsens eksistens til flertallet som ender skjult.
  if (modulState.status === "LOADING" || modulState.status === "HIDDEN") {
    return null;
  }

  const isBestilt = modulState.paaminnelseStatus === "BESTILT";
  const action: Action = isBestilt ? "avbestill" : "bestill";

  return (
    <section
      aria-labelledby={PAAMINNELSE_HEADING_ID}
      className="mb-6 max-w-2xl"
    >
      <span role="status" className="sr-only">
        {statusMessage ?? ""}
      </span>
      <InfoCard data-color="info">
        <InfoCard.Header>
          <InfoCard.Title as="h2" id={PAAMINNELSE_HEADING_ID}>
            Start oppfølgingen tidlig
          </InfoCard.Title>
        </InfoCard.Header>
        <InfoCard.Content>
          <VStack gap="space-16">
            {isBestilt ? (
              <BodyLong size="small">
                Du har bestilt en påminnelse på e-post. Du kan avbestille den
                hvis du ikke lenger trenger den.
              </BodyLong>
            ) : (
              <VStack gap="space-8">
                <BodyLong size="small">
                  Oppfølgingsplanen skal lages sammen med den sykmeldte. Planen
                  skal være klar senest når den sykmeldte har vært sykmeldt i
                  fire uker.
                </BodyLong>
                <BodyLong size="small" weight="semibold">
                  Vil du ha en påminnelse på e-post når det nærmer seg fristen?
                </BodyLong>
              </VStack>
            )}

            {actionError && (
              <LocalAlert status="error" size="small" as="div">
                <LocalAlert.Header>
                  <LocalAlert.Title as="h3">
                    {actionError === "bestill"
                      ? "Vi kunne ikke bestille påminnelsen"
                      : "Vi kunne ikke avbestille påminnelsen"}
                  </LocalAlert.Title>
                </LocalAlert.Header>
                <LocalAlert.Content>
                  Prøv igjen om litt. Hvis feilen fortsetter, kan du gå videre
                  uten å gjøre noe her.
                </LocalAlert.Content>
              </LocalAlert>
            )}

            <HStack gap="space-8" wrap>
              <Button
                loading={pendingAction === action}
                variant={isBestilt ? "secondary" : "primary"}
                data-color={isBestilt ? "neutral" : undefined}
                onClick={() => {
                  void handleAction(action);
                }}
              >
                {isBestilt ? "Avbestill påminnelse" : "Ja, minn meg på det"}
              </Button>
            </HStack>
          </VStack>
        </InfoCard.Content>
      </InfoCard>
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
      const nextStatusForCurrentSykmelding =
        nextStatus.status !== "SKJULT" &&
        nextStatus.synligFra == null &&
        modulState.status === "VISIBLE"
          ? { ...nextStatus, synligFra: modulState.synligFra }
          : nextStatus;

      setModulState(
        toModulState(nextStatusForCurrentSykmelding, sykmeldingPerioder),
      );

      if (nextStatusForCurrentSykmelding.status !== "SKJULT") {
        setStatusMessage(
          actionToRun === "bestill"
            ? "Påminnelse om oppfølgingsplan bestilt"
            : "Påminnelse om oppfølgingsplan avbestilt",
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
  sykmeldingPerioder,
}: {
  readonly narmestelederId: string;
  readonly orgnummer: string;
  readonly signal: AbortSignal;
  readonly sykmeldingPerioder: SykmeldingFragment["perioder"];
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

  return toModulState(paaminnelseStatus, sykmeldingPerioder);
}

function toModulState(
  paaminnelseStatus: PaaminnelseStatus,
  sykmeldingPerioder: SykmeldingFragment["perioder"],
): ModulState {
  const synligFra = paaminnelseStatus.synligFra;

  if (
    paaminnelseStatus.status === "SKJULT" ||
    synligFra == null ||
    !isSykmeldingInnenforPaaminnelseperiode(sykmeldingPerioder, synligFra)
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
  const json = await fetchJson("/api/tiltakspakkevurdering", {
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
  return `/api/paaminnelse/${encodeURIComponent(narmestelederId)}`;
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

function isSykmeldingInnenforPaaminnelseperiode(
  perioder: SykmeldingFragment["perioder"],
  synligFra: string,
): boolean {
  const tidligsteFom = perioder
    .map((periode) => periode.fom)
    .sort((left, right) => left.localeCompare(right))[0];

  return tidligsteFom != null && tidligsteFom >= synligFra;
}

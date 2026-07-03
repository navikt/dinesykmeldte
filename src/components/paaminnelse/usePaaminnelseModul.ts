import { useEffect, useMemo, useState } from "react";
import type { SykmeldingFragment } from "../../graphql/queries/graphql.generated";
import { paaminnelseApi } from "../../services/paaminnelse/paaminnelseClient";
import { hentTiltakspakkevurderinger } from "../../services/tiltakspakke/tiltakspakkevurderingClient";
import {
  type Action,
  backfillSynligFra,
  finnTidligsteFom,
  isTiltaksgruppeForOrgnummer,
  type ModulState,
  toModulState,
  type VisiblePaaminnelseStatus,
} from "./paaminnelseModulState";

type Params = {
  readonly narmestelederId: string;
  readonly orgnummer: string;
  readonly sykmeldingPerioder: SykmeldingFragment["perioder"];
};

/**
 * Modulens tilstand sett fra presentasjonen. LOADING og HIDDEN kollapses bevisst
 * til `skjult` — begge skal rendre ingenting, slik at et merket lastekort ikke
 * blinker påminnelsens eksistens til flertallet som ender skjult (default-deny).
 */
export type PaaminnelseModulTilstand =
  | { visning: "skjult" }
  | {
      visning: "synlig";
      paaminnelseStatus: VisiblePaaminnelseStatus;
      pendingAction: Action | null;
      actionError: Action | null;
      fullfortHandling: Action | null;
      utfoerHandling: (action: Action) => void;
    };

export function usePaaminnelseModul({
  narmestelederId,
  orgnummer,
  sykmeldingPerioder,
}: Params): PaaminnelseModulTilstand {
  const [modulState, setModulState] = useState<ModulState>({
    status: "LOADING",
  });
  const [pendingAction, setPendingAction] = useState<Action | null>(null);
  const [actionError, setActionError] = useState<Action | null>(null);
  const [fullfortHandling, setFullfortHandling] = useState<Action | null>(null);

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

    void lastInitialTilstand({
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

  if (modulState.status !== "VISIBLE") {
    return { visning: "skjult" };
  }

  return {
    visning: "synlig",
    paaminnelseStatus: modulState.paaminnelseStatus,
    pendingAction,
    actionError,
    fullfortHandling,
    utfoerHandling,
  };

  async function utfoerHandling(action: Action): Promise<void> {
    setPendingAction(action);
    setActionError(null);

    try {
      const nyStatus =
        action === "bestill"
          ? await paaminnelseApi.bestill(narmestelederId)
          : await paaminnelseApi.avbestill(narmestelederId);

      const neste = backfillSynligFra(nyStatus, modulState);
      setModulState(toModulState(neste, tidligsteFom));

      // Signaliser fullført handling som en semantisk hendelse; presentasjonen
      // eier hvordan (og om) den annonseres. SKJULT-resultat avmonterer kortet,
      // så da er det ingenting å annonsere.
      if (neste.status !== "SKJULT") {
        setFullfortHandling(action);
      }
    } catch {
      setActionError(action);
    } finally {
      setPendingAction(null);
    }
  }
}

async function lastInitialTilstand({
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
    hentTiltakspakkevurderinger(signal),
    paaminnelseApi.hentStatus(narmestelederId, signal),
  ]);

  if (!isTiltaksgruppeForOrgnummer(tiltakspakkevurderinger, orgnummer)) {
    return { status: "HIDDEN" };
  }

  return toModulState(paaminnelseStatus, tidligsteFom);
}

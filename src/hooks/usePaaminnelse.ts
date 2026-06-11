import {
  type Dispatch,
  type SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type {
  PaaminnelseBestiltStatus,
  PaaminnelseFeilkode,
  PaaminnelseStatus,
  PaaminnelseTilbudStatus,
} from "../services/paaminnelse/paaminnelseContract";
import {
  AvbestillPaaminnelseResponseSchema,
  BestillPaaminnelseResponseSchema,
  HentPaaminnelseStatusResponseSchema,
  PaaminnelseFeilResponseSchema,
} from "../services/paaminnelse/paaminnelseContract";
import { browserEnv } from "../utils/env";

type VisiblePaaminnelseState =
  | {
      status: "tilbud";
      paaminnelse: PaaminnelseTilbudStatus;
      inlineError: PaaminnelseFeilkode | null;
      isMutating: boolean;
    }
  | {
      status: "bestilt";
      paaminnelse: PaaminnelseBestiltStatus;
      inlineError: PaaminnelseFeilkode | null;
      isMutating: boolean;
    };

export type PaaminnelseState =
  | {
      status: "laster";
      paaminnelse: null;
      inlineError: null;
      isMutating: false;
    }
  | {
      status: "skjult";
      paaminnelse: null;
      inlineError: null;
      isMutating: false;
    }
  | VisiblePaaminnelseState;

type PaaminnelseMutation = () => Promise<void>;

export type UsePaaminnelse = PaaminnelseState & {
  bestill: PaaminnelseMutation;
  avbestill: PaaminnelseMutation;
  refetch: () => Promise<void>;
};

const INITIAL_STATE: PaaminnelseState = {
  status: "laster",
  paaminnelse: null,
  inlineError: null,
  isMutating: false,
};

const SKJULT_STATE: PaaminnelseState = {
  status: "skjult",
  paaminnelse: null,
  inlineError: null,
  isMutating: false,
};

export function usePaaminnelse(
  narmestelederId: string | null | undefined,
): UsePaaminnelse {
  const apiUrl = useMemo(() => {
    if (!narmestelederId) {
      return null;
    }

    return `${browserEnv.publicPath ?? ""}/api/paaminnelse/${encodeURIComponent(
      narmestelederId,
    )}`;
  }, [narmestelederId]);
  const [state, setState] = useState<PaaminnelseState>(INITIAL_STATE);
  const requestSequenceRef = useRef(0);

  const nextRequestSequence = useCallback((): number => {
    requestSequenceRef.current += 1;
    return requestSequenceRef.current;
  }, []);

  const isCurrentRequest = useCallback((requestSequence: number): boolean => {
    return requestSequenceRef.current === requestSequence;
  }, []);

  const refetch = useCallback(async (): Promise<void> => {
    const requestSequence = nextRequestSequence();

    if (!apiUrl) {
      setState(SKJULT_STATE);
      return;
    }

    setState(INITIAL_STATE);

    const nextState = await fetchPaaminnelseStatus(apiUrl);
    if (isCurrentRequest(requestSequence)) {
      setState(nextState);
    }
  }, [apiUrl, isCurrentRequest, nextRequestSequence]);

  useEffect(() => {
    void refetch();

    return () => {
      nextRequestSequence();
    };
  }, [refetch, nextRequestSequence]);

  const bestill = useCallback(async (): Promise<void> => {
    const requestSequence = nextRequestSequence();

    if (!apiUrl) {
      setState(SKJULT_STATE);
      return;
    }

    await mutatePaaminnelse(
      () =>
        fetch(apiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        }),
      "BESTILLING_FEILET",
      BestillPaaminnelseResponseSchema.parse,
      setState,
      () => isCurrentRequest(requestSequence),
    );
  }, [apiUrl, isCurrentRequest, nextRequestSequence]);

  const avbestill = useCallback(async (): Promise<void> => {
    const requestSequence = nextRequestSequence();

    if (!apiUrl) {
      setState(SKJULT_STATE);
      return;
    }

    await mutatePaaminnelse(
      () => fetch(apiUrl, { method: "DELETE" }),
      "AVBESTILLING_FEILET",
      AvbestillPaaminnelseResponseSchema.parse,
      setState,
      () => isCurrentRequest(requestSequence),
    );
  }, [apiUrl, isCurrentRequest, nextRequestSequence]);

  return {
    ...state,
    bestill,
    avbestill,
    refetch,
  };
}

async function fetchPaaminnelseStatus(
  apiUrl: string,
): Promise<PaaminnelseState> {
  try {
    const response = await fetch(apiUrl);
    if (!response.ok) {
      return SKJULT_STATE;
    }

    return toPaaminnelseState(
      HentPaaminnelseStatusResponseSchema.parse(await response.json()),
    );
  } catch {
    return SKJULT_STATE;
  }
}

async function mutatePaaminnelse(
  request: () => Promise<Response>,
  fallbackFeilkode: PaaminnelseFeilkode,
  parseResponse: (data: unknown) => PaaminnelseStatus,
  setState: Dispatch<SetStateAction<PaaminnelseState>>,
  shouldSetState: () => boolean,
): Promise<void> {
  setState((currentState) => markMutating(currentState, true));

  try {
    const response = await request();
    const responseBody = await response.json();
    if (!shouldSetState()) {
      return;
    }

    if (!response.ok) {
      setState((currentState) =>
        markMutationError(
          currentState,
          getFeilkode(responseBody, fallbackFeilkode),
        ),
      );
      return;
    }

    setState(toPaaminnelseState(parseResponse(responseBody)));
  } catch {
    if (!shouldSetState()) {
      return;
    }

    setState((currentState) =>
      markMutationError(currentState, fallbackFeilkode),
    );
  }
}

function toPaaminnelseState(status: PaaminnelseStatus): PaaminnelseState {
  switch (status.status) {
    case "SKJULT":
      return SKJULT_STATE;
    case "TILBUD":
      return {
        status: "tilbud",
        paaminnelse: status,
        inlineError: null,
        isMutating: false,
      };
    case "BESTILT":
      return {
        status: "bestilt",
        paaminnelse: status,
        inlineError: null,
        isMutating: false,
      };
  }
}

function markMutating(
  state: PaaminnelseState,
  isMutating: boolean,
): PaaminnelseState {
  if (state.status !== "tilbud" && state.status !== "bestilt") {
    return state;
  }

  return {
    ...state,
    inlineError: null,
    isMutating,
  };
}

function markMutationError(
  state: PaaminnelseState,
  feilkode: PaaminnelseFeilkode,
): PaaminnelseState {
  if (state.status !== "tilbud" && state.status !== "bestilt") {
    return state;
  }

  return {
    ...state,
    inlineError: feilkode,
    isMutating: false,
  };
}

function getFeilkode(
  responseBody: unknown,
  fallbackFeilkode: PaaminnelseFeilkode,
): PaaminnelseFeilkode {
  const parseResult = PaaminnelseFeilResponseSchema.safeParse(responseBody);

  return parseResult.success ? parseResult.data.feilkode : fallbackFeilkode;
}

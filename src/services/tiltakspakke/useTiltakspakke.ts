"use client";

import { useQuery as useApolloQuery } from "@apollo/client/react";
import { useQuery } from "@tanstack/react-query";
import { VirksomheterDocument } from "../../graphql/queries/graphql.generated";
import { fetchTiltakspakkevurderinger } from "./tiltakspakkevurderingClient";
import type {
  TiltakspakkeId,
  Tiltakspakkevurderinger,
} from "./tiltakspakkevurderingContract";
import { isTiltaksgruppeForAnyOrgnummer } from "./tiltakspakkevurderingGating";

export const TILTAKSPAKKEVURDERING_QUERY_KEY = [
  "tiltakspakkevurderinger",
] as const;

const TWELVE_HOURS_IN_MS = 12 * 60 * 60 * 1000;

export type Tiltakspakkevurderingstatus = {
  readonly vurderinger: Tiltakspakkevurderinger | undefined;
  readonly orgnumre: ReadonlyArray<string>;
  readonly isVurderingComplete: boolean;
};

export type Tiltakspakke = {
  readonly isInTiltaksgruppe: boolean;
  readonly isVurderingComplete: boolean;
};

/**
 * Tiltakspakkevurderingen for alle lederens virksomheter. Felles spørringsnøkkel
 * gjør at flere kall ikke gir flere hentinger.
 */
export function useTiltakspakkevurderinger(): Tiltakspakkevurderingstatus {
  const { data: virksomheterData, loading: virksomheterLoading } =
    useApolloQuery(VirksomheterDocument);

  const orgnumre =
    virksomheterData?.virksomheter
      .map((it) => it.orgnummer)
      .filter((it) => it.length > 0) ?? [];
  const hasContext = orgnumre.length > 0;

  const { data, isPending } = useQuery({
    queryKey: TILTAKSPAKKEVURDERING_QUERY_KEY,
    queryFn: ({ signal }) => fetchTiltakspakkevurderinger(signal),
    enabled: hasContext,
    staleTime: TWELVE_HOURS_IN_MS,
    retry: false,
  });

  return {
    vurderinger: hasContext ? data : undefined,
    orgnumre,
    isVurderingComplete: !virksomheterLoading && (!hasContext || !isPending),
  };
}

/**
 * Tiltaksgruppetilhørighet i én tiltakspakke på tvers av alle lederens
 * virksomheter, uavhengig av valgt virksomhet: minst én i tiltaksgruppen holder.
 */
export function useTiltakspakke(tiltakspakkeId: TiltakspakkeId): Tiltakspakke {
  const { vurderinger, orgnumre, isVurderingComplete } =
    useTiltakspakkevurderinger();

  return {
    isInTiltaksgruppe:
      vurderinger != null &&
      isTiltaksgruppeForAnyOrgnummer(tiltakspakkeId, vurderinger, orgnumre),
    isVurderingComplete,
  };
}

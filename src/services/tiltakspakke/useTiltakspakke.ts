"use client";

import { useQuery as useApolloQuery } from "@apollo/client/react";
import { useQuery } from "@tanstack/react-query";
import { VirksomheterDocument } from "../../graphql/queries/graphql.generated";
import { fetchTiltakspakkevurderinger } from "./tiltakspakkevurderingClient";
import type {
  Tildelingsgruppe,
  TiltakspakkevurderingTiltakspakkeId,
} from "./tiltakspakkevurderingContract";
import {
  getTildelingsgruppe,
  isTiltaksgruppeForAnyOrgnummer,
} from "./tiltakspakkevurderingGating";

export const TILTAKSPAKKEVURDERING_QUERY_KEY = [
  "tiltakspakkevurderinger",
] as const;

const TWELVE_HOURS_IN_MS = 12 * 60 * 60 * 1000;

export type Tiltakspakke = {
  readonly gruppe: Tildelingsgruppe;
  readonly isInTiltaksgruppe: boolean;
  /** Svar mottatt eller kall feilet, slik at «nei» ikke bare betyr «ikke hentet ennå». */
  readonly isVurderingComplete: boolean;
};

/**
 * Tiltaksgruppetilhørighet i én tiltakspakke på tvers av alle lederens
 * virksomheter, uavhengig av valgt virksomhet: minst én i tiltaksgruppen holder.
 */
export function useTiltakspakke(
  tiltakspakkeId: TiltakspakkevurderingTiltakspakkeId,
): Tiltakspakke {
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

  const virksomheterLoaded = !virksomheterLoading;

  if (!hasContext) {
    return {
      gruppe: "ukjent",
      isInTiltaksgruppe: false,
      isVurderingComplete: virksomheterLoaded,
    };
  }

  return {
    gruppe: getTildelingsgruppe(tiltakspakkeId, data, orgnumre),
    isInTiltaksgruppe:
      data != null &&
      isTiltaksgruppeForAnyOrgnummer(tiltakspakkeId, data, orgnumre),
    isVurderingComplete: virksomheterLoaded && !isPending,
  };
}

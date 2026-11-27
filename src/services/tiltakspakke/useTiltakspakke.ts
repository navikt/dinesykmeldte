"use client";

import { useQuery as useApolloQuery } from "@apollo/client/react";
import { useQuery } from "@tanstack/react-query";
import {
  MineSykmeldteDocument,
  VirksomheterDocument,
} from "../../graphql/queries/graphql.generated";
import useParam, { RouteLocation } from "../../hooks/useParam";
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
 * Vurderingen hentes alltid for alle lederens virksomheter, men hvilke
 * virksomheter som avgjør visningen (`orgnumre`) kommer an på siden: på
 * oversikten alle, slik at minst én i tiltaksgruppen holder; på sykmeldtsiden
 * (`/sykmeldt/:id`) bare den sykmeldtes. Finnes ikke den sykmeldte, avgjør ingen.
 *
 * Felles spørringsnøkkel gjør at flere kall ikke gir flere hentinger.
 */
export function useTiltakspakkevurderinger(): Tiltakspakkevurderingstatus {
  const { sykmeldtId } = useParam(RouteLocation.Root);
  const { data: virksomheterData, loading: virksomheterLoading } =
    useApolloQuery(VirksomheterDocument);
  const { data: sykmeldteData, loading: sykmeldteLoading } = useApolloQuery(
    MineSykmeldteDocument,
    { skip: !sykmeldtId },
  );

  const alleOrgnumre =
    virksomheterData?.virksomheter
      .map((it) => it.orgnummer)
      .filter((it) => it.length > 0) ?? [];
  const hasContext = alleOrgnumre.length > 0;

  const sykmeldtOrgnummer = sykmeldteData?.mineSykmeldte?.find(
    (it) => it.narmestelederId === sykmeldtId,
  )?.orgnummer;
  const orgnumre = sykmeldtId
    ? [sykmeldtOrgnummer].filter((it): it is string => Boolean(it))
    : alleOrgnumre;

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
    isVurderingComplete:
      !virksomheterLoading &&
      !(sykmeldtId && sykmeldteLoading) &&
      (!hasContext || !isPending),
  };
}

/** Tiltaksgruppetilhørighet i én tiltakspakke, se {@link useTiltakspakkevurderinger}. */
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

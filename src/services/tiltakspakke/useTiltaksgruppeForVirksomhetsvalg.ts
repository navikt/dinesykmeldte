"use client";

import { useQuery as useApolloQuery } from "@apollo/client";
import { VirksomheterDocument } from "../../graphql/queries/graphql.generated";
import useSelectedVirksomhet from "../../hooks/useSelectedSykmeldt";
import { useErMinstEnITiltaksgruppe } from "./useTiltakspakkevurdering";

type Virksomhet = {
  readonly orgnummer: string;
};

/**
 * Finner virksomhetskonteksten tiltakspakkevurderingen skal gjelde for.
 *
 * Tiltakspakkevurderingen er definert per virksomhet, og virksomhetsvelgeren
 * avgjør hvilke virksomheter som er i spill:
 *
 * - Er en konkret virksomhet valgt, er det bare denne virksomhetens vurdering
 *   som gjelder — samme mekanisme som påminnelsen om oppfølgingsplan.
 * - Er «Alle virksomheter» valgt (eller ingenting valgt ennå), gjelder alle
 *   virksomhetene brukeren har, og «minst én»-regelen slår inn. Det er avklart
 *   med fag at brukeren kan være i tiltaksgruppen gjennom én virksomhet og
 *   samtidig ha virksomheter i kontrollgruppen.
 *
 * Er listen tom (f.eks. før virksomhetene er hentet), finnes ingen kontekst,
 * og default-deny slår inn.
 */
export function utledOrgnumreForVurdering(
  valgtVirksomhet: string,
  virksomheter: ReadonlyArray<Virksomhet> | undefined,
): ReadonlyArray<string> {
  if (valgtVirksomhet !== "" && valgtVirksomhet !== "all") {
    return [valgtVirksomhet];
  }

  return virksomheter?.map((it) => it.orgnummer) ?? [];
}

/**
 * Tiltaksgruppevurderingen for virksomhetene som er valgt i virksomhetsvelgeren.
 */
export type TiltaksgruppeForVirksomhetsvalg = {
  /** Sann kun når minst én virksomhet eksplisitt er i tiltaksgruppen. */
  readonly erITiltaksgruppe: boolean;
  /**
   * Sann når både virksomhetskonteksten og tiltakspakkevurderingen er ferdig
   * behandlet.
   */
  readonly erVurderingFerdig: boolean;
};

/**
 * Vurderer tiltaksgruppetilhørighet for gjeldende virksomhetsvalg. Konsumentene
 * avgjør selv hvilken visning tilhørigheten skal styre.
 */
export function useTiltaksgruppeForVirksomhetsvalg(): TiltaksgruppeForVirksomhetsvalg {
  const valgtVirksomhet = useSelectedVirksomhet();
  const { data: virksomheterData, loading: virksomheterLoading } =
    useApolloQuery(VirksomheterDocument);

  const orgnumre = utledOrgnumreForVurdering(
    valgtVirksomhet,
    virksomheterData?.virksomheter,
  );

  const { erITiltaksgruppe, erVurderingFerdig } =
    useErMinstEnITiltaksgruppe(orgnumre);

  return {
    erITiltaksgruppe,
    // Virksomhetene avgjør hvilken kontekst vurderingen gjelder for. Så lenge
    // de ikke er hentet, er konteksten tom, og et «nei» fra vurderingen ville
    // bare vært mangel på data.
    erVurderingFerdig: !virksomheterLoading && erVurderingFerdig,
  };
}

"use client";

import { useQuery as useApolloQuery } from "@apollo/client";
import { VirksomheterDocument } from "../../graphql/queries/graphql.generated";
import useSelectedVirksomhet from "../../hooks/useSelectedSykmeldt";
import { useErMinstEnITiltaksgruppe } from "../../services/tiltakspakke/useTiltakspakkevurdering";

type Virksomhet = {
  readonly orgnummer: string;
};

/**
 * Finner virksomhetskonteksten boksen skal vurderes mot.
 *
 * Tiltakspakkevurderingen er definert per virksomhet, og virksomhetsvelgeren
 * avgjør hvilke virksomheter som er i spill:
 *
 * - Er en konkret virksomhet valgt, er det bare denne virksomhetens vurdering
 *   som gjelder — samme mekanisme som påminnelsen om oppfølgingsplan.
 * - Er «Alle virksomheter» valgt (eller ingenting valgt ennå), gjelder alle
 *   virksomhetene brukeren har, og «minst én»-regelen slår inn: boksen vises
 *   hvis minst én av dem er i tiltaksgruppen. Det er avklart med fag at
 *   brukeren samtidig kan ha virksomheter i kontrollgruppen.
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
 * Gating for «Kom i gang tidlig»-boksen på Dine sykmeldte (#742). Bruker samme
 * delte tiltakspakke-kilde, cache og default-deny-regel som påminnelsen om
 * oppfølgingsplan (`useErMinstEnITiltaksgruppe`).
 */
export function useVisKomIGangTidlig(): boolean {
  const valgtVirksomhet = useSelectedVirksomhet();
  const { data: virksomheterData } = useApolloQuery(VirksomheterDocument);

  const orgnumre = utledOrgnumreForVurdering(
    valgtVirksomhet,
    virksomheterData?.virksomheter,
  );

  const { erITiltaksgruppe } = useErMinstEnITiltaksgruppe(orgnumre);

  return erITiltaksgruppe;
}

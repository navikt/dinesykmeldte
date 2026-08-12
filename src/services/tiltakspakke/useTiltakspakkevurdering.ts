"use client";

import { useQuery } from "@tanstack/react-query";
import { hentTiltakspakkevurderinger } from "./tiltakspakkevurderingClient";
import { isTiltaksgruppeForMinstEttOrgnummer } from "./tiltakspakkevurderingGating";

/**
 * Delt cache-nøkkel for tiltakspakkevurderinger. Alle konsumenter må bruke
 * denne nøkkelen (via hookene under) slik at vurderingen hentes én gang per
 * økt og ikke kan divergere mellom flatene.
 */
export const TILTAKSPAKKEVURDERING_QUERY_KEY = [
  "tiltakspakkevurderinger",
] as const;

const TOLV_TIMER_I_MS = 12 * 60 * 60 * 1000;

export type TiltakspakkeGating = {
  /**
   * Sann kun når minst ett av orgnumrene i konteksten eksplisitt er i
   * tiltaksgruppen for `OPPFOLGINGSPLAN_TILTAKSPAKKE_1`. Default-deny for alt
   * annet.
   */
  readonly erITiltaksgruppe: boolean;
  /**
   * Sann når vurderingen er ferdig behandlet: svaret er mottatt, kallet feilet,
   * eller det finnes ingen orgnummerkontekst å vurdere. Brukes av tester for å
   * skille «skjult fordi vurderingen sier nei» fra «skjult fordi vurderingen
   * ikke er hentet ennå».
   */
  readonly erAvklart: boolean;
};

/**
 * Én delt kilde for tiltakspakkevurdering, cache og default-deny-semantikk.
 *
 * Gatingen besvarer «er minst én av disse virksomhetene i tiltaksgruppen?».
 * For påminnelsesmekanismen består konteksten alltid av nøyaktig ett
 * orgnummer, og da er svaret identisk med den opprinnelige regelen. Uten
 * orgnummerkontekst gjøres ingen vurdering, og default-deny slår inn.
 *
 * Merk: hva BFF-en faktisk svarer er avgrenset av #740 (ekte
 * Flaggskipet-integrasjon). Denne hooken tolker kun svaret.
 */
export function useErMinstEnITiltaksgruppe(
  orgnumre: ReadonlyArray<string>,
): TiltakspakkeGating {
  const orgnummerkontekst = orgnumre.filter((it) => it.length > 0);
  const harKontekst = orgnummerkontekst.length > 0;

  const { data, isPending } = useQuery({
    queryKey: TILTAKSPAKKEVURDERING_QUERY_KEY,
    queryFn: ({ signal }) => hentTiltakspakkevurderinger(signal),
    enabled: harKontekst,
    staleTime: TOLV_TIMER_I_MS,
    retry: false,
  });

  if (!harKontekst) {
    return { erITiltaksgruppe: false, erAvklart: true };
  }

  return {
    erITiltaksgruppe:
      data != null &&
      isTiltaksgruppeForMinstEttOrgnummer(data, orgnummerkontekst),
    erAvklart: !isPending,
  };
}

/**
 * Vurdering av nøyaktig ett orgnummer — mekanismen påminnelsesmodulen alltid
 * har brukt. Tynn innpakning rundt `useErMinstEnITiltaksgruppe`, slik at
 * query, cache og default-deny er nøyaktig den samme.
 */
export function useErITiltaksgruppe(
  orgnummer: string | null,
): TiltakspakkeGating {
  return useErMinstEnITiltaksgruppe(orgnummer != null ? [orgnummer] : []);
}

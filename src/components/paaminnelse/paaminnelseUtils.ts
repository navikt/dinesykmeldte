import {
  OPPFOLGINGSPLAN_TILTAKSPAKKE_1,
  type Tiltakspakkevurderinger,
} from "../../services/tiltakspakke/tiltakspakkevurderingContract";

/**
 * Default-deny gating: kun `deltakelse === "TILTAKSGRUPPE"` for den relevante
 * virksomheten i `OPPFOLGINGSPLAN_TILTAKSPAKKE_1` åpner for visning. Alt annet
 * (fravær, tom liste, andre grupper, ukjent orgnummer) betyr «ikke vis».
 */
export function isTiltaksgruppeForOrgnummer(
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

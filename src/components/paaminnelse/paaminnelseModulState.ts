import type { SykmeldingFragment } from "../../graphql/queries/graphql.generated";
import type { PaaminnelseStatus } from "../../services/paaminnelse/paaminnelseContract";
import {
  OPPFOLGINGSPLAN_TILTAKSPAKKE_1,
  type Tiltakspakkevurderinger,
} from "../../services/tiltakspakke/tiltakspakkevurderingContract";

export type VisiblePaaminnelseStatus = Exclude<
  PaaminnelseStatus["status"],
  "SKJULT"
>;

export type ModulState =
  | { status: "LOADING" }
  | { status: "HIDDEN" }
  | {
      status: "VISIBLE";
      paaminnelseStatus: VisiblePaaminnelseStatus;
      synligFra: string;
    };

export type Action = "bestill" | "avbestill";

/**
 * Oversetter en påminnelse-status til modulens visningstilstand. Default-deny:
 * SKJULT, manglende `synligFra`, eller en sykmelding som starter før `synligFra`
 * gir HIDDEN. Kun et gyldig, åpent vindu gir VISIBLE.
 */
export function toModulState(
  paaminnelseStatus: PaaminnelseStatus,
  tidligsteFom: string | null,
): ModulState {
  const synligFra = paaminnelseStatus.synligFra;

  if (
    paaminnelseStatus.status === "SKJULT" ||
    synligFra == null ||
    !isSykmeldingInnenforPaaminnelseperiode(tidligsteFom, synligFra)
  ) {
    return { status: "HIDDEN" };
  }

  return {
    status: "VISIBLE",
    paaminnelseStatus: paaminnelseStatus.status,
    synligFra,
  };
}

/**
 * Skrivekontrakten svarer i dag uten `synligFra`. Per-sykmelding-synligheten er
 * allerede avgjort da modulen ble VISIBLE, så vi beholder `synligFra` fra forrige
 * tilstand slik at boksen ikke forsvinner rett etter en handling. Returnerer
 * backend en ekte `synligFra` senere, brukes den i stedet; skrivesvar `SKJULT`
 * skjuler riktig (fail-safe).
 */
export function backfillSynligFra(
  nyStatus: PaaminnelseStatus,
  forrige: ModulState,
): PaaminnelseStatus {
  if (
    nyStatus.status !== "SKJULT" &&
    nyStatus.synligFra == null &&
    forrige.status === "VISIBLE"
  ) {
    return { ...nyStatus, synligFra: forrige.synligFra };
  }

  return nyStatus;
}

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

export function finnTidligsteFom(
  perioder: SykmeldingFragment["perioder"],
): string | null {
  return (
    perioder
      .map((periode) => periode.fom)
      .sort((left, right) => left.localeCompare(right))[0] ?? null
  );
}

function isSykmeldingInnenforPaaminnelseperiode(
  tidligsteFom: string | null,
  synligFra: string,
): boolean {
  return tidligsteFom != null && tidligsteFom >= synligFra;
}

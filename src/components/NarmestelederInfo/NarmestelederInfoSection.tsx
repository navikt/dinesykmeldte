"use client";

import type { ReactElement } from "react";
import { useTiltaksgruppeForVirksomhetsvalg } from "../../services/tiltakspakke/useTiltaksgruppeForVirksomhetsvalg";
import AnsvarVedSykefravaer from "../AnsvarVedSykefravaer/AnsvarVedSykefravaer";
import MerOmOppfolging from "../stegoversikt/MerOmOppfolging";
import NarmestelederInfo from "./NarmestelederInfo";

function NarmestelederInfoSection({
  stegoversiktAktiv = false,
}: {
  readonly stegoversiktAktiv?: boolean;
}): ReactElement | null {
  const { erITiltaksgruppe, erVurderingFerdig, gruppe } =
    useTiltaksgruppeForVirksomhetsvalg();

  if (!erVurderingFerdig) return null;

  if (erITiltaksgruppe && stegoversiktAktiv) {
    return <MerOmOppfolging gruppe={gruppe} />;
  }

  return erITiltaksgruppe ? <AnsvarVedSykefravaer /> : <NarmestelederInfo />;
}

export default NarmestelederInfoSection;

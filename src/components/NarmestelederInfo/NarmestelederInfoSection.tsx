"use client";

import type { ReactElement } from "react";
import { useTiltaksgruppeForVirksomhetsvalg } from "../../services/tiltakspakke/useTiltaksgruppeForVirksomhetsvalg";
import AnsvarVedSykefravaer from "../AnsvarVedSykefravaer/AnsvarVedSykefravaer";
import NarmestelederInfo from "./NarmestelederInfo";

function NarmestelederInfoSection(): ReactElement | null {
  const { erITiltaksgruppe, erVurderingFerdig } =
    useTiltaksgruppeForVirksomhetsvalg();

  if (!erVurderingFerdig) return null;

  return erITiltaksgruppe ? <AnsvarVedSykefravaer /> : <NarmestelederInfo />;
}

export default NarmestelederInfoSection;

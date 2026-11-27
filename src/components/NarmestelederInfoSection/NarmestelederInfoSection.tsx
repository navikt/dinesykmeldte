"use client";

import { DIALOGMOTE_TILTAKSPAKKE_2 } from "../../services/tiltakspakke/tiltakspakkevurderingContract";
import { useTiltakspakke } from "../../services/tiltakspakke/useTiltakspakke";
import AnsvarVedSykefravaer from "../AnsvarVedSykefravaer/AnsvarVedSykefravaer";
import MerOmOppfolging from "../stegoversikt/MerOmOppfolging";

function NarmestelederInfoSection() {
  const tiltakspakke2 = useTiltakspakke(DIALOGMOTE_TILTAKSPAKKE_2);

  if (!tiltakspakke2.isVurderingComplete) return null;
  if (tiltakspakke2.isInTiltaksgruppe) {
    return <MerOmOppfolging />;
  }

  return <AnsvarVedSykefravaer />;
}

export default NarmestelederInfoSection;

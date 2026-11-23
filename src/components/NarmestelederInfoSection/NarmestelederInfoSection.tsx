"use client";

import type { ReactElement } from "react";
import { DIALOGMOTE_TILTAKSPAKKE_2 } from "../../services/tiltakspakke/tiltakspakkevurderingContract";
import { useTiltaksgruppeForVirksomhetsvalg } from "../../services/tiltakspakke/useTiltaksgruppeForVirksomhetsvalg";
import AnsvarVedSykefravaer from "../AnsvarVedSykefravaer/AnsvarVedSykefravaer";
import MerOmOppfolging from "../stegoversikt/MerOmOppfolging";

function NarmestelederInfoSection({
  stegoversiktAktiv = false,
}: {
  readonly stegoversiktAktiv?: boolean;
}): ReactElement | null {
  const tiltakspakke2 = useTiltaksgruppeForVirksomhetsvalg(
    DIALOGMOTE_TILTAKSPAKKE_2,
  );

  if (!tiltakspakke2.erVurderingFerdig) {
    return null;
  }

  if (stegoversiktAktiv && tiltakspakke2.erITiltaksgruppe) {
    return <MerOmOppfolging gruppe={tiltakspakke2.gruppe} />;
  }

  return <AnsvarVedSykefravaer />;
}

export default NarmestelederInfoSection;

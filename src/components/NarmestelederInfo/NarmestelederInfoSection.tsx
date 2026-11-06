"use client";

import type { ReactElement } from "react";
import {
  DIALOGMOTE_TILTAKSPAKKE_2,
  OPPFOLGINGSPLAN_TILTAKSPAKKE_1,
} from "../../services/tiltakspakke/tiltakspakkevurderingContract";
import { useTiltaksgruppeForVirksomhetsvalg } from "../../services/tiltakspakke/useTiltaksgruppeForVirksomhetsvalg";
import AnsvarVedSykefravaer from "../AnsvarVedSykefravaer/AnsvarVedSykefravaer";
import MerOmOppfolging from "../stegoversikt/MerOmOppfolging";
import NarmestelederInfo from "./NarmestelederInfo";

function NarmestelederInfoSection({
  stegoversiktAktiv = false,
}: {
  readonly stegoversiktAktiv?: boolean;
}): ReactElement | null {
  const tiltakspakke1 = useTiltaksgruppeForVirksomhetsvalg(
    OPPFOLGINGSPLAN_TILTAKSPAKKE_1,
  );
  const tiltakspakke2 = useTiltaksgruppeForVirksomhetsvalg(
    DIALOGMOTE_TILTAKSPAKKE_2,
  );

  if (!tiltakspakke1.erVurderingFerdig || !tiltakspakke2.erVurderingFerdig) {
    return null;
  }

  if (stegoversiktAktiv && tiltakspakke2.erITiltaksgruppe) {
    return <MerOmOppfolging gruppe={tiltakspakke2.gruppe} />;
  }

  return tiltakspakke1.erITiltaksgruppe ? (
    <AnsvarVedSykefravaer />
  ) : (
    <NarmestelederInfo />
  );
}

export default NarmestelederInfoSection;

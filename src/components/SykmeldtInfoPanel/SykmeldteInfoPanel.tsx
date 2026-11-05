"use client";

import type { ReactElement } from "react";
import { OPPFOLGINGSPLAN_TILTAKSPAKKE_1 } from "../../services/tiltakspakke/tiltakspakkevurderingContract";
import { useTiltaksgruppeForVirksomhetsvalg } from "../../services/tiltakspakke/useTiltaksgruppeForVirksomhetsvalg";
import KomIGangTidligInfo from "../komigangtidlig/KomIGangTidligInfo";
import DismissableVeileder from "../shared/veileder/DismissableVeileder";

/**
 * Informasjonsboksen øverst på Dine sykmeldte. Tiltaksgruppen i tiltakspakke 1
 * (oppfølgingsplan) får «Kom i gang tidlig» (#742) i stedet for
 * personalansvarsboksen. Valget ligger her, i én gren, slik at boksene ikke kan
 * bli synlige samtidig.
 */
function SykmeldteInfoPanel(): ReactElement | null {
  const tiltakspakke1 = useTiltaksgruppeForVirksomhetsvalg(
    OPPFOLGINGSPLAN_TILTAKSPAKKE_1,
  );

  // Vi venter til vurderingen er ferdig før vi velger boks. Uten dette ville
  // personalansvarsboksen rukket å vises for tiltaksgruppen og blitt byttet ut
  // idet svaret kom.
  if (!tiltakspakke1.erVurderingFerdig) return null;

  if (tiltakspakke1.erITiltaksgruppe) {
    return <KomIGangTidligInfo />;
  }

  return (
    <DismissableVeileder
      storageKey="personalansvar-info"
      text={[
        `Hei, vi har fått vite at du har personalansvar for noen som er sykmeldt i denne virksomheten.`,
        "Under finner du oversikten over sykmeldte medarbeiderne og tilhørende informasjon og tjenester som skal hjelpe deg med oppfølgingen.",
      ]}
    />
  );
}

export default SykmeldteInfoPanel;

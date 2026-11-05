"use client";

import { useQuery } from "@apollo/client/react";
import type { ReactElement } from "react";
import { MineSykmeldteDocument } from "../../graphql/queries/graphql.generated";
import {
  DIALOGMOTE_TILTAKSPAKKE_2,
  OPPFOLGINGSPLAN_TILTAKSPAKKE_1,
} from "../../services/tiltakspakke/tiltakspakkevurderingContract";
import { useTiltaksgruppeForVirksomhetsvalg } from "../../services/tiltakspakke/useTiltaksgruppeForVirksomhetsvalg";
import KomIGangTidligInfo from "../komigangtidlig/KomIGangTidligInfo";
import DismissableVeileder from "../shared/veileder/DismissableVeileder";
import { VeilederBorder } from "../shared/veileder/Veileder";
import Stegoversikt from "../stegoversikt/Stegoversikt";

/**
 * Informasjonsboksen øverst på Dine sykmeldte.
 *
 * Tiltaksgruppen i tiltakspakke 2 (dialogmøte) får stegoversikten (#818) når
 * togglen er på. Ellers får tiltaksgruppen i tiltakspakke 1 (oppfølgingsplan)
 * «Kom i gang tidlig» (#742) i stedet for personalansvarsboksen. Valget ligger
 * her, i én gren, slik at boksene ikke kan bli synlige samtidig.
 */
function SykmeldteInfoPanel({
  stegoversiktAktiv,
}: {
  readonly stegoversiktAktiv: boolean;
}): ReactElement | null {
  const { data, loading } = useQuery(MineSykmeldteDocument);
  const tiltakspakke1 = useTiltaksgruppeForVirksomhetsvalg(
    OPPFOLGINGSPLAN_TILTAKSPAKKE_1,
  );
  const tiltakspakke2 = useTiltaksgruppeForVirksomhetsvalg(
    DIALOGMOTE_TILTAKSPAKKE_2,
  );

  if (loading || !data) return null;

  if (!data?.mineSykmeldte?.length) {
    return (
      <VeilederBorder
        text={[
          "Hei, ingen av de medarbeiderene du er registrert som leder for har aktive sykmeldinger, og derfor vises de ikke her",
          "Hvis du savner noen av medarbeiderne dine som er sykmeldt nå kan du kontakte dem i virksomheten som tar i mot sykmeldinger i Altinn. De melder inn hvem som er leder for den sykmeldte.",
        ]}
      />
    );
  }

  // Vi venter til tiltakspakkevurderingen er ferdig behandlet før vi velger
  // boks. Uten dette ville personalansvarsboksen rukket å vises for
  // tiltaksgruppen og blitt byttet ut idet svaret kom.
  if (!tiltakspakke1.erVurderingFerdig || !tiltakspakke2.erVurderingFerdig) {
    return null;
  }

  if (stegoversiktAktiv && tiltakspakke2.erITiltaksgruppe) {
    return <Stegoversikt gruppe={tiltakspakke2.gruppe} />;
  }

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

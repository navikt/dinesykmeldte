"use client";

import { useQuery } from "@apollo/client";
import type { ReactElement } from "react";
import { MineSykmeldteDocument } from "../../graphql/queries/graphql.generated";
import { useTiltaksgruppeForVirksomhetsvalg } from "../../services/tiltakspakke/useTiltaksgruppeForVirksomhetsvalg";
import KomIGangTidligInfo from "../komigangtidlig/KomIGangTidligInfo";
import DismissableVeileder from "../shared/veileder/DismissableVeileder";
import { VeilederBorder } from "../shared/veileder/Veileder";

/**
 * Informasjonsboksen øverst på Dine sykmeldte.
 *
 * For tiltaksgruppen i Flaggskipet erstatter «Kom i gang tidlig» (#742)
 * personalansvarsboksen. Valget mellom de to ligger her, i én gren, slik at de
 * ikke kan bli synlige samtidig.
 */
function SykmeldteInfoPanel(): ReactElement | null {
  const { data, loading } = useQuery(MineSykmeldteDocument);
  const { erITiltaksgruppe, erVurderingFerdig } =
    useTiltaksgruppeForVirksomhetsvalg();

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
  if (!erVurderingFerdig) return null;

  if (erITiltaksgruppe) {
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

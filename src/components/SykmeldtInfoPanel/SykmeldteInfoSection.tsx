"use client";

import { useQuery } from "@apollo/client/react";
import type { ReactElement } from "react";
import { MineSykmeldteDocument } from "../../graphql/queries/graphql.generated";
import { DIALOGMOTE_TILTAKSPAKKE_2 } from "../../services/tiltakspakke/tiltakspakkevurderingContract";
import { useTiltaksgruppeForVirksomhetsvalg } from "../../services/tiltakspakke/useTiltaksgruppeForVirksomhetsvalg";
import { VeilederBorder } from "../shared/veileder/Veileder";
import Stegoversikt from "../stegoversikt/Stegoversikt";
import SykmeldteInfoPanel from "./SykmeldteInfoPanel";

/**
 * Toppen av Dine sykmeldte. Uten aktive sykmeldte vises tomtilstanden. Ellers
 * får tiltaksgruppen i tiltakspakke 2 (dialogmøte) stegoversikten (#818) når
 * togglen er på, og alle andre får informasjonspanelet. Valget ligger her, i
 * én gren, slik at stegoversikten og panelet ikke kan vises samtidig.
 */
function SykmeldteInfoSection({
  stegoversiktAktiv = false,
}: {
  readonly stegoversiktAktiv?: boolean;
}): ReactElement | null {
  const { data, loading } = useQuery(MineSykmeldteDocument);
  const tiltakspakke2 = useTiltaksgruppeForVirksomhetsvalg(
    DIALOGMOTE_TILTAKSPAKKE_2,
  );

  if (loading || !data) return null;

  if (!data.mineSykmeldte?.length) {
    return (
      <VeilederBorder
        text={[
          "Hei, ingen av de medarbeiderene du er registrert som leder for har aktive sykmeldinger, og derfor vises de ikke her",
          "Hvis du savner noen av medarbeiderne dine som er sykmeldt nå kan du kontakte dem i virksomheten som tar i mot sykmeldinger i Altinn. De melder inn hvem som er leder for den sykmeldte.",
        ]}
      />
    );
  }

  // Mens vurderingen er uavklart er `erITiltaksgruppe` usann, og panelet viser
  // ingenting fordi det venter på den samme vurderingen. Panelet skal bli
  // stående montert i mellomtiden: avmonteres det, starter en feilet
  // vurdering en ny henting når panelet monteres igjen.
  if (stegoversiktAktiv && tiltakspakke2.erITiltaksgruppe) {
    return <Stegoversikt gruppe={tiltakspakke2.gruppe} />;
  }

  return <SykmeldteInfoPanel />;
}

export default SykmeldteInfoSection;

"use client";

import { useQuery } from "@apollo/client";
import type { ReactElement } from "react";
import { MineSykmeldteDocument } from "../../graphql/queries/graphql.generated";
import DismissableVeileder from "../shared/veileder/DismissableVeileder";
import { VeilederBorder } from "../shared/veileder/Veileder";

function SykmeldteInfoPanel(): ReactElement | null {
  const { data, loading } = useQuery(MineSykmeldteDocument);

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

  return (
    <DismissableVeileder
      storageKey="personalansvar-info"
      /*
       * «Kom i gang tidlig» (#742) ligger rett over denne boksen og har
       * space-24 bunnmargin som avstand til det som følger etter. De to
       * informasjonsflatene trenger mer luft seg imellom enn den vanlige
       * rytmen, og denne boksen eier derfor selv de ekstra space-16 på toppen.
       *
       * Padding og ikke margin: padding kollapser ikke mot marginen over, så
       * luften legger seg faktisk til i stedet for å bli max() av de to. Og
       * fordi luften rendres sammen med boksen, forsvinner den helt når
       * brukeren krysser boksen ut – da står «Kom i gang»-boksens space-24
       * igjen alene, som før.
       */
      paddingBlock="space-16 space-0"
      text={[
        `Hei, vi har fått vite at du har personalansvar for noen som er sykmeldt i denne virksomheten.`,
        "Under finner du oversikten over sykmeldte medarbeiderne og tilhørende informasjon og tjenester som skal hjelpe deg med oppfølgingen.",
      ]}
    />
  );
}

export default SykmeldteInfoPanel;

"use client";

import { LightBulbIcon } from "@navikt/aksel-icons";
import { BodyLong, Box, InfoCard } from "@navikt/ds-react";
import type { ReactElement } from "react";
import { useVisKomIGangTidlig } from "./useVisKomIGangTidlig";

const KOM_I_GANG_TIDLIG_HEADING_ID = "kom-i-gang-tidlig-heading";

/**
 * Informasjonsboks øverst på Dine sykmeldte som oppfordrer arbeidsgiver til å
 * starte oppfølgingen tidlig (#742). Vises kun for tiltaksgruppen i
 * Flaggskipet; gatingen ligger i `useVisKomIGangTidlig`.
 *
 * Boksen er ren informasjon uten interaksjon, og navngis derfor som en landmark
 * via tittelen slik at skjermlesere kan hoppe rett til den.
 */
function KomIGangTidligInfo(): ReactElement | null {
  const visBoks = useVisKomIGangTidlig();

  if (!visBoks) {
    return null;
  }

  return (
    <Box marginBlock="space-0 space-24">
      <InfoCard as="section" aria-labelledby={KOM_I_GANG_TIDLIG_HEADING_ID}>
        <InfoCard.Header icon={<LightBulbIcon aria-hidden />}>
          <InfoCard.Title as="h2" id={KOM_I_GANG_TIDLIG_HEADING_ID}>
            Kom i gang tidlig når en ansatt er sykmeldt
          </InfoCard.Title>
        </InfoCard.Header>
        <InfoCard.Content>
          <BodyLong>
            Å ta den første samtalen tidlig viser at du er der. Å ha kontakt
            helt fra start og følge opp underveis kan gjøre det enklere for den
            som er sykmeldt å komme tilbake til jobb, at risiko for langvarig
            sykefravær reduseres.
          </BodyLong>
        </InfoCard.Content>
      </InfoCard>
    </Box>
  );
}

export default KomIGangTidligInfo;

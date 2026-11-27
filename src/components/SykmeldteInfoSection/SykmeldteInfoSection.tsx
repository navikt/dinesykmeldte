"use client";

import { useQuery } from "@apollo/client/react";
import { LightBulbIcon } from "@navikt/aksel-icons";
import { BodyLong, Box, InfoCard } from "@navikt/ds-react";
import { MineSykmeldteDocument } from "../../graphql/queries/graphql.generated";
import { DIALOGMOTE_TILTAKSPAKKE_2 } from "../../services/tiltakspakke/tiltakspakkevurderingContract";
import { useTiltakspakke } from "../../services/tiltakspakke/useTiltakspakke";
import { VeilederBorder } from "../shared/veileder/Veileder";
import Stegoversikt from "../stegoversikt/Stegoversikt";

const KOM_I_GANG_TIDLIG_HEADING_ID = "kom-i-gang-tidlig-heading";

function SykmeldteInfoSection() {
  const { data, loading } = useQuery(MineSykmeldteDocument);
  const tiltakspakke2 = useTiltakspakke(DIALOGMOTE_TILTAKSPAKKE_2);

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

  if (!tiltakspakke2.isVurderingComplete) return null;
  if (tiltakspakke2.isInTiltaksgruppe) return <Stegoversikt />;

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

export default SykmeldteInfoSection;

import { BodyLong, Heading, Link, VStack } from "@navikt/ds-react";
import type { ReactElement } from "react";
import type { Tildelingsgruppe } from "../../services/tiltakspakke/tiltakspakkevurderingContract";
import HvorforVerdtDet from "./HvorforVerdtDet";
import type { Steg } from "./stegoversiktSteg";
import { recordStegoversiktLinkClick } from "./stegoversiktTelemetry";

function StegPanel({
  steg,
  gruppe,
}: {
  readonly steg: Steg;
  readonly gruppe: Tildelingsgruppe;
}): ReactElement {
  return (
    <VStack gap="space-16" paddingBlock="space-16 space-0">
      <Heading level="3" size="small">
        {steg.overskrift}
      </Heading>
      {steg.avsnitt.map((avsnitt) => (
        <BodyLong key={avsnitt}>{avsnitt}</BodyLong>
      ))}
      <HvorforVerdtDet>{steg.hvorfor}</HvorforVerdtDet>
      {steg.lenker.length > 0 && (
        <VStack gap="space-8">
          {steg.lenker.map(({ lenke, href, tekst }) => (
            <Link
              key={lenke}
              href={href}
              onClick={() =>
                recordStegoversiktLinkClick(gruppe, lenke, steg.fane)
              }
            >
              {tekst}
            </Link>
          ))}
        </VStack>
      )}
    </VStack>
  );
}

export default StegPanel;

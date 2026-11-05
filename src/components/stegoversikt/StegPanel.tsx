import { BodyLong, Heading, Link, List, VStack } from "@navikt/ds-react";
import type { ReactElement } from "react";
import type { Tildelingsgruppe } from "../../services/tiltakspakke/tiltakspakkevurderingContract";
import HvorforVerdtDet from "./HvorforVerdtDet";
import {
  recordStegoversiktLinkClick,
  type StegoversiktFane,
  type StegoversiktLenke,
} from "./stegoversiktTelemetry";

interface StegLenke {
  readonly lenke: StegoversiktLenke;
  readonly href: string;
  readonly tekst: string;
}

export interface Steg {
  readonly fane: StegoversiktFane;
  readonly tittel: string;
  readonly tidspunkt: string;
  readonly overskrift: string;
  readonly innhold: readonly StegInnhold[];
  readonly hvorfor: string;
  readonly lenker: readonly StegLenke[];
}

type StegInnhold =
  | { readonly type: "avsnitt"; readonly tekst: string }
  | { readonly type: "liste"; readonly punkter: readonly string[] };

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
      {steg.innhold.map((blokk) => {
        const key =
          blokk.type === "avsnitt" ? blokk.tekst : blokk.punkter.join(" ");

        return blokk.type === "avsnitt" ? (
          <BodyLong key={key}>{blokk.tekst}</BodyLong>
        ) : (
          <List key={key} as="ul" size="large">
            {blokk.punkter.map((punkt) => (
              <List.Item key={punkt}>{punkt}</List.Item>
            ))}
          </List>
        );
      })}
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

import { BodyShort, Detail, Tabs, VStack } from "@navikt/ds-react";
import type { ReactElement } from "react";
import { useState } from "react";
import type { Tildelingsgruppe } from "../../services/tiltakspakke/tiltakspakkevurderingContract";
import StegPanel from "./StegPanel";
import { STEGOVERSIKT_STEG } from "./stegoversiktSteg";
import {
  recordStegoversiktTabSelected,
  STEGOVERSIKT_FANER,
  type StegoversiktFane,
} from "./stegoversiktTelemetry";

function StegoversiktFaner({
  gruppe,
}: {
  readonly gruppe: Tildelingsgruppe;
}): ReactElement {
  const [valgtFane, setValgtFane] =
    useState<StegoversiktFane>("hold_kontakten");

  return (
    <Tabs
      value={valgtFane}
      onChange={(value) => {
        const fane = STEGOVERSIKT_FANER.find((it) => it === value);
        if (fane) {
          setValgtFane(fane);
          recordStegoversiktTabSelected(gruppe, fane);
        }
      }}
      size="small"
    >
      <Tabs.List aria-label="Oppfølgingspunkter">
        {STEGOVERSIKT_STEG.map(({ fane, tittel, tidspunkt }) => (
          <Tabs.Tab
            key={fane}
            value={fane}
            label={
              <VStack as="span">
                <BodyShort as="span" size="small" weight="semibold">
                  {tittel}
                </BodyShort>
                <Detail as="span">{tidspunkt}</Detail>
              </VStack>
            }
          />
        ))}
      </Tabs.List>
      {STEGOVERSIKT_STEG.map((steg) => (
        <Tabs.Panel key={steg.fane} value={steg.fane}>
          <StegPanel steg={steg} gruppe={gruppe} />
        </Tabs.Panel>
      ))}
    </Tabs>
  );
}

export default StegoversiktFaner;

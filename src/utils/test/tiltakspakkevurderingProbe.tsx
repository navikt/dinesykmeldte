import type { ReactElement } from "react";
import { useErITiltaksgruppe } from "../../services/tiltakspakke/useTiltakspakkevurdering";
import { screen } from "./testUtils";

const PROBE_TEST_ID = "tiltakspakkevurdering-avklart";

/**
 * Orgnummer som med vilje ikke finnes i noe testdatasett. Proben skal kun
 * abonnere på den delte queryen, aldri påvirke gatingen til komponenten som
 * testes.
 */
const PROBE_ORGNUMMER = "probe-orgnummer-uten-vurdering";

/**
 * Test-probe som abonnerer på den samme delte tiltakspakke-queryen som
 * produksjonskoden, og først rendrer noe når vurderingen er ferdig behandlet
 * (svar mottatt eller kall feilet).
 *
 * Negative tester må rendre denne ved siden av komponenten og avvente
 * `ventPaaAvklartTiltakspakkevurdering()`. Uten den ville «boksen vises ikke»
 * vært grønn allerede fordi komponenten starter skjult, før svaret er behandlet.
 */
export function TiltakspakkevurderingProbe(): ReactElement | null {
  const { erVurderingFerdig } = useErITiltaksgruppe(PROBE_ORGNUMMER);

  return erVurderingFerdig ? <div data-testid={PROBE_TEST_ID} /> : null;
}

export async function ventPaaAvklartTiltakspakkevurdering(): Promise<void> {
  await screen.findByTestId(PROBE_TEST_ID);
}

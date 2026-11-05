import { BreakpointMdDown } from "@navikt/ds-tokens/js";
import { useEffect, useState } from "react";

/**
 * Startverdien settes bare ved mount: kortet er åpent på bred skjerm og
 * lukket på smal. Senere endringer i vindusbredden overstyrer ikke brukerens valg.
 */
export function useApenPaaBredSkjerm() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const smalSkjerm =
      typeof window.matchMedia === "function" &&
      window.matchMedia(`(max-width: ${BreakpointMdDown})`).matches;
    setOpen(!smalSkjerm);
  }, []);

  return [open, setOpen] as const;
}

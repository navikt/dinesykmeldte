import { BreakpointMdDown } from "@navikt/ds-tokens/js";
import { useEffect, useState } from "react";

/**
 * Set the initial state on mount: open on wide screens, closed on narrow ones.
 * Later viewport changes do not override the user's choice.
 */
export function useInitiallyOpenOnWideScreen() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const isNarrowScreen =
      typeof window.matchMedia === "function" &&
      window.matchMedia(`(max-width: ${BreakpointMdDown})`).matches;
    setOpen(!isNarrowScreen);
  }, []);

  return [open, setOpen] as const;
}

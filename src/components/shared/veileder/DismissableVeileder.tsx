"use client";

import { Box, Button } from "@navikt/ds-react";
import { type ComponentProps, type ReactElement, useState } from "react";
import { VeilederBorder } from "./Veileder";

type Props = {
  storageKey: string;
  title?: string;
  text: string | string[];
  onOk?: () => void;
  /**
   * Valgfri ekstra luft rundt boksen, som Aksel-spacingtoken.
   *
   * Ligger her og ikke som wrapper hos den som bruker komponenten, fordi
   * boksen kan krysses ut: luften rendres kun sammen med boksen, og forsvinner
   * helt når brukeren har lukket den.
   */
  paddingBlock?: ComponentProps<typeof Box>["paddingBlock"];
};

function DismissableVeileder({
  storageKey,
  title,
  text,
  onOk,
  paddingBlock,
}: Props): ReactElement | null {
  const [hasDismissed, setDismissed] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;

    const storage = window.localStorage;
    if (!storage || typeof storage.getItem !== "function") return false;

    try {
      return JSON.parse(storage.getItem(storageKey) ?? "false") === true;
    } catch {
      return false;
    }
  });

  if (hasDismissed) return null;

  const veileder = (
    <VeilederBorder title={title} text={text}>
      <Button
        size="small"
        className="mt-4"
        variant="secondary"
        onClick={() => {
          if (typeof window !== "undefined") {
            const storage = window.localStorage;
            if (storage && typeof storage.setItem === "function") {
              storage.setItem(storageKey, "true");
            }
          }

          setDismissed(true);
          onOk?.();
        }}
      >
        OK
      </Button>
    </VeilederBorder>
  );

  // Uten `paddingBlock` beholder vi markupen uendret for de som ikke trenger
  // ekstra luft.
  if (!paddingBlock) return veileder;

  // `print:hidden` fordi veilederboksen selv skjules ved utskrift. Uten dette
  // ville wrapperen blitt stående igjen som tom luft på papiret.
  return (
    <Box paddingBlock={paddingBlock} className="print:hidden">
      {veileder}
    </Box>
  );
}

export default DismissableVeileder;

import React, { ReactElement, useState } from "react";
import { Button } from "@navikt/ds-react";
import { VeilederBorder } from "./Veileder";

type Props = {
  storageKey: string;
  title?: string;
  text: string | string[];
  onOk?: () => void;
};

function DismissableVeileder({
  storageKey,
  title,
  text,
  onOk,
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

  return (
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
}

export default DismissableVeileder;

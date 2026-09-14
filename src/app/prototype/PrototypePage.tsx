"use client";

import { Suspense } from "react";
import { OppfolgingArbeidsflate } from "../../prototype/components/OppfolgingArbeidsflate";
import { PrototypeRamme } from "../../prototype/components/PrototypeRamme";
import { PrototypeProvider } from "../../prototype/state/PrototypeContext";

export function PrototypePage() {
  return (
    <Suspense>
      <PrototypeProvider>
        <PrototypeRamme>
          <OppfolgingArbeidsflate />
        </PrototypeRamme>
      </PrototypeProvider>
    </Suspense>
  );
}

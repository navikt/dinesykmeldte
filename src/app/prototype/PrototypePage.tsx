"use client";

import { Box, Page, VStack } from "@navikt/ds-react";
import type { ReactElement } from "react";
import { PrototypeRamme } from "../../prototype/components/PrototypeRamme";
import {
  PrototypeProvider,
  usePrototype,
} from "../../prototype/state/PrototypeContext";
import { VariantA } from "../../prototype/varianter/VariantA";
import { VariantB } from "../../prototype/varianter/VariantB";
import { VariantC } from "../../prototype/varianter/VariantC";

function ValgtVariant(): ReactElement {
  const { variant } = usePrototype();
  if (variant === "A") return <VariantA />;
  if (variant === "C") return <VariantC />;
  return <VariantB />;
}

export function PrototypePage(): ReactElement {
  return (
    <PrototypeProvider>
      <Page.Block width="xl" gutters>
        <Box paddingBlock={{ xs: "space-16", md: "space-32" }}>
          <VStack gap="space-24">
            <PrototypeRamme>
              <ValgtVariant />
            </PrototypeRamme>
          </VStack>
        </Box>
      </Page.Block>
    </PrototypeProvider>
  );
}

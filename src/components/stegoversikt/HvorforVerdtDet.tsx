import { BodyLong, BodyShort, Box, VStack } from "@navikt/ds-react";
import type { ReactElement } from "react";

function HvorforVerdtDet({
  children,
}: {
  readonly children: string;
}): ReactElement {
  return (
    <Box
      borderColor="neutral-subtle"
      borderWidth="0 0 0 4"
      paddingInline="space-12"
    >
      <VStack gap="space-4">
        <BodyShort weight="semibold">Hvorfor er det verdt det?</BodyShort>
        <BodyLong>{children}</BodyLong>
      </VStack>
    </Box>
  );
}

export default HvorforVerdtDet;

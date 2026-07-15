import { BodyShort, Loader, VStack } from "@navikt/ds-react";

export default function Loading() {
  return (
    <VStack
      align="center"
      justify="center"
      gap="space-12"
      paddingBlock="space-64"
    >
      <Loader size="2xlarge" title="Laster innhold..." />
      <BodyShort aria-live="polite">Laster innhold</BodyShort>
    </VStack>
  );
}

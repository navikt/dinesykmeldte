"use client";

import { ArrowCirclepathIcon, LightBulbIcon } from "@navikt/aksel-icons";
import {
  BodyShort,
  Box,
  Button,
  Detail,
  Heading,
  HStack,
  Select,
  Tag,
  ToggleGroup,
  VStack,
} from "@navikt/ds-react";
import type { ReactElement } from "react";
import { SCENARIER } from "../data/scenarier";
import { usePrototype } from "../state/PrototypeContext";
import type { VariantId } from "../types";

const VARIANT_NAVN: Record<VariantId, string> = {
  A: "A — Neste handling",
  B: "B — Oppfølging over tid",
  C: "C — Arbeidsoversikt",
};

const VARIANT_SPORSMAL: Record<VariantId, string> = {
  A: "Holder det å vise lederen én ting om gangen, uten forløpet rundt?",
  B: "Gir forløpet over tid lederen bedre oversikt enn enkeltstående paneler?",
  C: "Bør lederen starte i en liste på tvers, med forløpet som detaljvisning?",
};

/**
 * Kontrollpanelet for demoen. Variantbytte beholder scenario og endringer, slik
 * at A, B og C kan sammenliknes på nøyaktig samme situasjon.
 */
export function PrototypeRamme({
  children,
}: {
  children: ReactElement;
}): ReactElement {
  const {
    variant,
    setVariant,
    scenario,
    setScenarioId,
    antallEndringer,
    nullstill,
  } = usePrototype();

  return (
    <VStack gap="space-24">
      <Box
        background="neutral-moderate"
        padding={{ xs: "space-16", md: "space-20" }}
        borderRadius="12"
      >
        <VStack gap="space-16">
          <HStack gap="space-8" align="center" justify="space-between" wrap>
            <HStack gap="space-8" align="center">
              <Tag variant="strong" data-color="warning" size="small">
                Prototype
              </Tag>
              <BodyShort size="small">
                Fiktive data. Ingenting lagres, sendes eller varsles.
              </BodyShort>
            </HStack>
            {antallEndringer > 0 && (
              <HStack gap="space-8" align="center">
                <Detail>
                  {`${antallEndringer} endring${antallEndringer === 1 ? "" : "er"} i denne økten`}
                </Detail>
                <Button
                  variant="tertiary"
                  size="xsmall"
                  icon={<ArrowCirclepathIcon aria-hidden />}
                  onClick={nullstill}
                >
                  Nullstill
                </Button>
              </HStack>
            )}
          </HStack>

          <HStack gap="space-20" align="end" wrap>
            <VStack gap="space-4">
              <ToggleGroup
                value={variant}
                onChange={(v) => setVariant(v as VariantId)}
                size="small"
                label="Hvilket konsept vil du se?"
              >
                {(["A", "B", "C"] as VariantId[]).map((id) => (
                  <ToggleGroup.Item key={id} value={id}>
                    {VARIANT_NAVN[id]}
                  </ToggleGroup.Item>
                ))}
              </ToggleGroup>
            </VStack>

            <Box minWidth="20rem">
              <Select
                label="Situasjon"
                size="small"
                value={scenario.id}
                onChange={(e) => setScenarioId(e.target.value)}
              >
                {SCENARIER.map((s) => (
                  <option key={s.id} value={s.id}>
                    {`${s.nummer}. ${s.navn}`}
                  </option>
                ))}
              </Select>
            </Box>
          </HStack>

          <Box background="default" padding="space-16" borderRadius="8">
            <VStack gap="space-8">
              <HStack gap="space-8" align="start" wrap={false}>
                <LightBulbIcon aria-hidden fontSize="1.25rem" />
                <VStack gap="space-4">
                  <Heading size="xsmall" level="2">
                    Hva vi vil finne ut
                  </Heading>
                  <BodyShort size="small">
                    {VARIANT_SPORSMAL[variant]}
                  </BodyShort>
                  <Detail textColor="subtle">
                    {`Situasjonen viser: ${scenario.laeringspoeng}`}
                  </Detail>
                </VStack>
              </HStack>
            </VStack>
          </Box>

          <Detail textColor="subtle">
            Bytter du konsept, beholdes situasjonen og endringene dine — slik
            kan du se samme sak i A, B og C. Bytter du situasjon, starter du på
            nytt.
          </Detail>
        </VStack>
      </Box>

      {children}
    </VStack>
  );
}

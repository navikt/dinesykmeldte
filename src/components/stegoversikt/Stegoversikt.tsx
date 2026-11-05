"use client";

import {
  ChevronDownIcon,
  ChevronUpIcon,
  TasklistIcon,
} from "@navikt/aksel-icons";
import {
  BodyLong,
  Box,
  Button,
  Heading,
  HStack,
  VStack,
} from "@navikt/ds-react";
import type { ReactElement } from "react";
import type { Tildelingsgruppe } from "../../services/tiltakspakke/tiltakspakkevurderingContract";
import StegoversiktFaner from "./StegoversiktFaner";
import {
  recordStegoversiktToggle,
  useStegoversiktTelemetry,
} from "./stegoversiktTelemetry";
import { useApenPaaBredSkjerm } from "./useApenPaaBredSkjerm";

const CONTENT_ID = "stegoversikt-innhold";
const HEADING_ID = "stegoversikt-heading";

function Stegoversikt({
  gruppe,
}: {
  readonly gruppe: Tildelingsgruppe;
}): ReactElement {
  const [open, setOpen] = useApenPaaBredSkjerm();
  const elementRef = useStegoversiktTelemetry(gruppe);

  return (
    <Box
      as="section"
      aria-labelledby={HEADING_ID}
      marginBlock="space-0 space-24"
      ref={elementRef}
    >
      <Box
        background="neutral-soft"
        borderRadius="12"
        paddingBlock="space-16"
        paddingInline={{ xs: "space-16", md: "space-24" }}
      >
        <VStack gap="space-16">
          <HStack align="start" justify="space-between" gap="space-16">
            <HStack align="start" gap="space-12" wrap={false}>
              <TasklistIcon
                aria-hidden
                className="text-ax-text-accent"
                fontSize="1.5rem"
              />
              <Heading level="2" size="medium" id={HEADING_ID}>
                De første ukene av sykefraværet
              </Heading>
            </HStack>
            <Button
              aria-controls={CONTENT_ID}
              aria-expanded={open}
              onClick={() => {
                recordStegoversiktToggle(gruppe, !open);
                setOpen(!open);
              }}
              size="small"
              variant="tertiary"
              icon={
                open ? (
                  <ChevronUpIcon aria-hidden />
                ) : (
                  <ChevronDownIcon aria-hidden />
                )
              }
              iconPosition="right"
            >
              Hva du skal gjøre
            </Button>
          </HStack>

          <BodyLong>
            Dette er det viktigste du gjør i de første ukene av sykefraværet.
          </BodyLong>

          <div id={CONTENT_ID} hidden={!open}>
            <Box
              background="default"
              borderRadius="8"
              paddingBlock="space-16"
              paddingInline={{ xs: "space-16", md: "space-24" }}
            >
              <StegoversiktFaner gruppe={gruppe} />
            </Box>
          </div>
        </VStack>
      </Box>
    </Box>
  );
}

export default Stegoversikt;

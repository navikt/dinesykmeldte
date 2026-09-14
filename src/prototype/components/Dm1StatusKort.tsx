"use client";

import {
  CalendarIcon,
  CheckmarkCircleIcon,
  PencilIcon,
  XMarkOctagonIcon,
} from "@navikt/aksel-icons";
import {
  BodyShort,
  Box,
  Button,
  DatePicker,
  Detail,
  HStack,
  InfoCard,
  Modal,
  Radio,
  RadioGroup,
  useDatepicker,
  VStack,
} from "@navikt/ds-react";
import { formatISO } from "date-fns";
import { type ReactElement, useState } from "react";
import { usePrototype } from "../state/PrototypeContext";
import type { Ansatt, Dm1Status, Dm1StatusType } from "../types";
import { formatDato } from "../utils/format";
import { dm1StatusTekst } from "../utils/oppfolging";

interface Props {
  ansatt: Ansatt;
  /** Kompakt variant til lister og tidslinje. */
  kompakt?: boolean;
}

const IKON: Record<Dm1StatusType, typeof CalendarIcon> = {
  ukjent: PencilIcon,
  planlagt: CalendarIcon,
  gjennomfort: CheckmarkCircleIcon,
  "vurdert-unodvendig": XMarkOctagonIcon,
};

/**
 * Viser og endrer lederens opplysning om dialogmøte 1.
 *
 * Registreringen er valgfri og lett å endre. Ingenting sendes til Nav eller den
 * ansatte — statusen finnes bare i denne prototypen.
 */
export function Dm1StatusKort({
  ansatt,
  kompakt = false,
}: Props): ReactElement {
  const { dm1For } = usePrototype();
  const [dialogApen, setDialogApen] = useState(false);
  const status = dm1For(ansatt.id);
  const Icon = IKON[status.type];

  return (
    <>
      <InfoCard>
        <InfoCard.Header icon={<Icon aria-hidden />}>
          <InfoCard.Title as="h3">Status for dialogmøte 1</InfoCard.Title>
        </InfoCard.Header>
        <InfoCard.Content>
          <VStack gap="space-12">
            <BodyShort>{dm1StatusTekst(status)}</BodyShort>

            {status.type !== "ukjent" && (
              <Detail>
                {`Du registrerte dette ${formatDato(status.registrertDato)}.`}
                {status.type === "gjennomfort" && !status.motedato
                  ? " Registreringsdato er ikke det samme som møtedato."
                  : ""}
              </Detail>
            )}

            {!kompakt && (
              <Detail>
                Registreringen er din egen opplysning. Nav får den ikke, og den
                ansatte varsles ikke.
              </Detail>
            )}

            <HStack gap="space-8">
              <Button
                variant={status.type === "ukjent" ? "secondary" : "tertiary"}
                size="small"
                onClick={() => setDialogApen(true)}
              >
                {status.type === "ukjent" ? "Legg inn status" : "Endre status"}
              </Button>
            </HStack>
          </VStack>
        </InfoCard.Content>
      </InfoCard>

      <Dm1StatusDialog
        ansatt={ansatt}
        apen={dialogApen}
        lukk={() => setDialogApen(false)}
      />
    </>
  );
}

interface DialogProps {
  ansatt: Ansatt;
  apen: boolean;
  lukk: () => void;
}

export function Dm1StatusDialog({
  ansatt,
  apen,
  lukk,
}: DialogProps): ReactElement {
  const { dm1For, settDm1 } = usePrototype();
  const naavaerende = dm1For(ansatt.id);
  const [valg, setValg] = useState<Dm1StatusType>(naavaerende.type);
  const [motedato, setMotedato] = useState<Date | undefined>(
    naavaerende.type === "planlagt"
      ? new Date(naavaerende.motedato)
      : naavaerende.type === "gjennomfort" && naavaerende.motedato
        ? new Date(naavaerende.motedato)
        : undefined,
  );

  const { datepickerProps, inputProps } = useDatepicker({
    defaultSelected: motedato,
    onDateChange: setMotedato,
  });

  const iDagIso = formatISO(new Date(), { representation: "date" });

  const lagre = (): void => {
    const dato = motedato
      ? formatISO(motedato, { representation: "date" })
      : null;

    let ny: Dm1Status;
    switch (valg) {
      case "ukjent":
        ny = { type: "ukjent" };
        break;
      case "planlagt":
        // Uten dato gir «planlagt» ingen mening, så vi faller tilbake til ukjent.
        ny = dato
          ? { type: "planlagt", motedato: dato, registrertDato: iDagIso }
          : { type: "ukjent" };
        break;
      case "gjennomfort":
        ny = { type: "gjennomfort", motedato: dato, registrertDato: iDagIso };
        break;
      case "vurdert-unodvendig":
        ny = { type: "vurdert-unodvendig", registrertDato: iDagIso };
        break;
    }

    settDm1(ansatt.id, ny);
    lukk();
  };

  return (
    <Modal
      open={apen}
      onClose={lukk}
      header={{ heading: "Status for dialogmøte 1", icon: <CalendarIcon /> }}
      width={560}
    >
      <Modal.Body>
        <VStack gap="space-20">
          <BodyShort>
            {`Hva vil du si om dialogmøte 1 med ${ansatt.navn}? Du kan endre dette når som helst.`}
          </BodyShort>

          <RadioGroup
            legend="Velg status"
            value={valg}
            onChange={(v: Dm1StatusType) => setValg(v)}
          >
            <Radio value="ukjent">
              Ingen status ennå
              <Detail>Du har ikke tatt stilling til møtet.</Detail>
            </Radio>
            <Radio value="planlagt">
              Møtet er planlagt
              <Detail>
                Dere har avtalt et tidspunkt. Møtet er ikke holdt.
              </Detail>
            </Radio>
            <Radio value="gjennomfort">
              Møtet er gjennomført
              <Detail>Dere har hatt samtalen.</Detail>
            </Radio>
            <Radio value="vurdert-unodvendig">
              Jeg vurderer møtet som åpenbart unødvendig
              <Detail>
                Dette er din vurdering, ikke et unntaksvedtak fra Nav.
              </Detail>
            </Radio>
          </RadioGroup>

          {(valg === "planlagt" || valg === "gjennomfort") && (
            <Box>
              <DatePicker {...datepickerProps}>
                <DatePicker.Input
                  {...inputProps}
                  label={
                    valg === "planlagt"
                      ? "Når skal møtet holdes?"
                      : "Når ble møtet holdt? (valgfritt)"
                  }
                  description={
                    valg === "gjennomfort"
                      ? "Uten møtedato viser vi bare at du har registrert møtet, ikke når det fant sted."
                      : undefined
                  }
                />
              </DatePicker>
            </Box>
          )}

          <Box background="neutral-soft" padding="space-12" borderRadius="8">
            <Detail>
              Dette er en prototype. Ingenting sendes til Nav, den ansatte eller
              andre. Statusen forsvinner når du laster siden på nytt.
            </Detail>
          </Box>
        </VStack>
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={lagre}>Lagre status</Button>
        <Button variant="secondary" onClick={lukk}>
          Avbryt
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

/** Liten statuslinje til lister der et helt kort blir for mye. */
export function Dm1StatusLinje({ ansatt }: { ansatt: Ansatt }): ReactElement {
  const { dm1For } = usePrototype();
  const status = dm1For(ansatt.id);
  const Icon = IKON[status.type];

  return (
    <HStack gap="space-8" align="center" wrap={false}>
      <Icon aria-hidden fontSize="1.25rem" />
      <BodyShort size="small">{dm1StatusTekst(status)}</BodyShort>
    </HStack>
  );
}

"use client";

import {
  CheckmarkCircleIcon,
  ClockDashedIcon,
  PersonPencilIcon,
} from "@navikt/aksel-icons";
import { Tag } from "@navikt/ds-react";
import type { ReactElement } from "react";
import type { Kilde } from "../types";

/**
 * Skiller de tre typene opplysninger fra hverandre i vanlig språk. Vi viser
 * aldri tekniske kildenavn, bare hvem som vet hva.
 */
const KILDE_TEKST: Record<Kilde, { etikett: string; forklaring: string }> = {
  kjent: {
    etikett: "Registrert",
    forklaring: "Dette er registrert og kjent for Nav.",
  },
  forventet: {
    etikett: "Forventet",
    forklaring:
      "Dette er et tidspunkt å forholde seg til, ikke noe som har skjedd.",
  },
  leder: {
    etikett: "Lagt inn av deg",
    forklaring: "Dette er din egen opplysning, ikke en bekreftelse fra Nav.",
  },
};

const IKON: Record<Kilde, typeof CheckmarkCircleIcon> = {
  kjent: CheckmarkCircleIcon,
  forventet: ClockDashedIcon,
  leder: PersonPencilIcon,
};

const VARIANT: Record<Kilde, "success" | "neutral" | "info"> = {
  kjent: "success",
  forventet: "neutral",
  leder: "info",
};

export function KildeMerke({ kilde }: { kilde: Kilde }): ReactElement {
  const { etikett, forklaring } = KILDE_TEKST[kilde];
  const Icon = IKON[kilde];

  return (
    <Tag
      variant="moderate"
      data-color={VARIANT[kilde]}
      size="xsmall"
      icon={<Icon aria-hidden />}
      title={forklaring}
    >
      {etikett}
    </Tag>
  );
}

export { KILDE_TEKST };

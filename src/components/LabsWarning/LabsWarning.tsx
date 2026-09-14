"use client";

import { GlobalAlert } from "@navikt/ds-react";
import { usePathname } from "next/navigation";
import type { ReactElement } from "react";
import { isLocalOrDemo } from "../../utils/env";

export function LabsWarning(): ReactElement | null {
  const pathname = usePathname();
  if (!isLocalOrDemo || pathname?.endsWith("/prototype")) {
    return null;
  }

  return (
    <GlobalAlert
      className="mx-auto my-8 w-4/5 max-w-4xl"
      role="status"
      status="warning"
      centered={false}
      as="div"
    >
      <GlobalAlert.Content>
        Dette er en demoside og inneholder ikke dine personlige data.
      </GlobalAlert.Content>
    </GlobalAlert>
  );
}

import { ClockIcon, PhoneIcon } from "@navikt/aksel-icons";
import { Heading, Label } from "@navikt/ds-react";
import React, { type PropsWithChildren, type ReactElement } from "react";

function KontaktInfoPanel({
  children,
}: PropsWithChildren<unknown>): ReactElement {
  return (
    <div className="bg-ax-bg-info-soft mb-8 px-8 pt-8 pb-2.5">
      {children}
      <Heading className="mb-6" size="small" level="3">
        Har du spørsmål som du ikke finner svar på her inne?
      </Heading>
      <div className="mx-0 my-4 flex items-center">
        <PhoneIcon role="img" aria-hidden />
        <Label className="ml-2">Arbeidsgivertelefonen: 55 55 33 36</Label>
      </div>
      <div className="mx-0 my-4 flex items-center">
        <ClockIcon role="img" aria-hidden />
        <Label className="ml-2">Åpen 9.00 - 15.00 mandag - fredag</Label>
      </div>
    </div>
  );
}

export default KontaktInfoPanel;

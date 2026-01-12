import React, { ReactElement } from "react";
import { BodyLong, BodyShort, ReadMore } from "@navikt/ds-react";

export const MerOmVarslinger = (): ReactElement => {
  return (
    <ReadMore className="my-4 ml-2" header="Mer om varslinger for søknaden">
      <BodyLong className="pb-2">
        Den ansatte blir varslet via sms og e-post dagen etter at søknaden er
        tilgjengelig for utfylling.
      </BodyLong>
      <BodyLong className="pb-2">
        Om søknaden fortsatt ikke er sendt inn etter:
      </BodyLong>
      <ul>
        <li className="grid grid-cols-[15%_85%] items-baseline max-[767px]:grid-cols-[20%_80%] max-[425px]:grid-cols-[25%_75%]">
          <BodyShort className="text-base font-semibold">1 uke:</BodyShort>
          <BodyLong>Den ansatte blir varslet på sms og e-post.</BodyLong>
        </li>
        <li className="grid grid-cols-[15%_85%] items-baseline max-[767px]:grid-cols-[20%_80%] max-[425px]:grid-cols-[25%_75%]">
          <BodyShort className="text-base font-semibold">2 uker:</BodyShort>
          <BodyLong>
            Nærmeste leder varsles på e-post og Dine sykmeldte.
          </BodyLong>
        </li>
        <li className="grid grid-cols-[15%_85%] items-baseline max-[767px]:grid-cols-[20%_80%] max-[425px]:grid-cols-[25%_75%]">
          <BodyShort className="text-base font-semibold">3 uker:</BodyShort>
          <BodyLong>
            Virksomheten varsles på e-post og sms, og får en infomelding i
            Altinn.
          </BodyLong>
        </li>
      </ul>
    </ReadMore>
  );
};

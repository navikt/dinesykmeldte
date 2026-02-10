import React, { ReactElement } from "react";
import { BodyLong, Label, ReadMore } from "@navikt/ds-react";

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
          <Label as="span">1 uke:</Label>
          <BodyLong>Den ansatte blir varslet på sms og e-post.</BodyLong>
        </li>
        <li className="grid grid-cols-[15%_85%] items-baseline max-[767px]:grid-cols-[20%_80%] max-[425px]:grid-cols-[25%_75%]">
          <Label as="span">2 uker:</Label>
          <BodyLong>
            Nærmeste leder varsles på e-post og Dine sykmeldte.
          </BodyLong>
        </li>
        <li className="grid grid-cols-[15%_85%] items-baseline max-[767px]:grid-cols-[20%_80%] max-[425px]:grid-cols-[25%_75%]">
          <Label as="span">3 uker:</Label>
          <BodyLong>
            Virksomheten varsles på e-post og sms, og får en infomelding i
            Altinn.
          </BodyLong>
        </li>
      </ul>
    </ReadMore>
  );
};

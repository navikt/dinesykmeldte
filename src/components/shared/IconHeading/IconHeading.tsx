import React, { ReactElement } from "react";
import { BandageIcon } from "@navikt/aksel-icons";
import { Heading } from "@navikt/ds-react";

interface Props {
  headingId: string;
  title: string;
  Icon: typeof BandageIcon;
}

export function IconHeading({ headingId, title, Icon }: Props): ReactElement {
  return (
    <div className="flex items-center py-2">
      <Icon
        className="text-ax-text-warning mr-1.5 text-xl"
        role="img"
        aria-hidden
      />
      <Heading id={headingId} size="xsmall" level="3" className="text-base">
        {title}
      </Heading>
    </div>
  );
}

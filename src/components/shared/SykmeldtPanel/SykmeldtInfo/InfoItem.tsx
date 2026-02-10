import React, { ReactElement, ReactNode } from "react";
import { BandageIcon } from "@navikt/aksel-icons";
import { BodyShort, Label } from "@navikt/ds-react";
import { cleanId } from "../../../../utils/stringUtils";

interface InfoItemProps {
  id: string;
  title: string;
  text: string | ReactNode;
  Icon: typeof BandageIcon;
}

export function InfoItem({
  title,
  text,
  Icon,
  id,
}: InfoItemProps): ReactElement {
  const labelId = typeof text == "string" ? text : "ikke-din-ansatt";
  const listItemId = cleanId(labelId + id);
  return (
    <div className="flex items-center max-[783px]:items-start">
      <Icon className="pr-4 text-4xl" role="img" aria-hidden />
      <div className="flex-col pr-10 max-[783px]:flex-col max-[783px]:pr-5">
        <Label htmlFor={listItemId}>{title}</Label>
        <BodyShort
          id={listItemId}
          size="small"
          className="[&>button]:text-start"
        >
          {text}
        </BodyShort>
      </div>
    </div>
  );
}

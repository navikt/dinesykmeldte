import React, { ReactElement } from "react";
import { BodyShort, Heading } from "@navikt/ds-react";
import { cleanId } from "../../../utils/stringUtils";
import { cn } from "../../../utils/tw-utils";

interface ListItemProps {
  title: string;
  text: string | string[];
  headingLevel: "2" | "3" | "4" | "5" | "6";
  bgListItem?: boolean;
}

export function ListItem({
  title,
  text,
  headingLevel,
  bgListItem,
}: ListItemProps): ReactElement {
  const listItemId = cleanId(title);

  return (
    <li
      className={cn(
        "mt-4 mb-7 no-underline first-of-type:mt-0 last-of-type:mb-0",
        {
          "bg-ax-bg-neutral-soft mb-5 rounded px-7 py-5 print:py-0": bgListItem,
        },
      )}
      aria-labelledby={listItemId}
    >
      <Heading
        id={listItemId}
        size="small"
        className="mb-1"
        level={headingLevel}
      >
        {title}
      </Heading>
      {Array.isArray(text) ? (
        <ul className="list-none p-0">
          {text.map((it) => (
            <BodyShort
              className="mb-1 last-of-type:m-0"
              key={it}
              as="li"
              size="small"
            >
              {it}
            </BodyShort>
          ))}
        </ul>
      ) : (
        <BodyShort className="mb-1 last-of-type:m-0" size="small">
          {text}
        </BodyShort>
      )}
    </li>
  );
}

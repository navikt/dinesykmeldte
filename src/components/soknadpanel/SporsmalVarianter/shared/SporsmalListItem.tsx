import React, { PropsWithChildren, ReactElement } from "react";

interface SporsmalListItemProps {
  listItemId?: string;
}

function SporsmalListItem({
  children,
  listItemId,
}: PropsWithChildren<SporsmalListItemProps>): ReactElement {
  return (
    <li
      className="bg-ax-bg-neutral-soft mb-5 rounded px-7 py-5 print:py-0"
      aria-labelledby={listItemId ?? "list-item"}
    >
      {children}
    </li>
  );
}

export default SporsmalListItem;

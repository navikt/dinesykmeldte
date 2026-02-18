import type { PropsWithChildren, ReactElement } from "react";

interface SporsmalListItemNestedProps {
  listItemId?: string;
}

function SporsmalListItemNested({
  children,
  listItemId,
}: PropsWithChildren<SporsmalListItemNestedProps>): ReactElement {
  return (
    <li className="my2" aria-labelledby={listItemId}>
      {children}
    </li>
  );
}

export default SporsmalListItemNested;

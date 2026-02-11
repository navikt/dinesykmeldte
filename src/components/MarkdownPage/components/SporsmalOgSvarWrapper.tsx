import React, { PropsWithChildren, ReactElement } from "react";
import { cn } from "../../../utils/tw-utils";

interface SporsmalOgSvarWrapperProps {
  graaInfoPanel?: boolean;
}

function SporsmalOgSvarWrapper({
  children,
  graaInfoPanel,
}: PropsWithChildren<SporsmalOgSvarWrapperProps>): ReactElement {
  return (
    <div
      className={cn("border-ax-border-neutral-subtle mb-10 border-b pb-4", {
        "bg-ax-bg-neutral-soft mb-5 border-none px-8 pt-8 pb-4": graaInfoPanel,
      })}
    >
      {children}
    </div>
  );
}

export default SporsmalOgSvarWrapper;

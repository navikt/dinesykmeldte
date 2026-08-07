import { Skeleton } from "@navikt/ds-react";
import type { ReactElement } from "react";

interface Props {
  widths: ReadonlyArray<string>;
}

function InfoRowSkeleton({ widths }: Props): ReactElement {
  return (
    <li className="pb-4">
      <div className="flex items-center gap-1.5 py-2">
        <Skeleton variant="rounded" width={20} height={20} />
        <Skeleton variant="text" width="38%" />
      </div>
      <div className="flex flex-col gap-1 rounded bg-ax-bg-neutral-soft px-7 py-5">
        {widths.map((width) => (
          <Skeleton key={width} variant="text" width={width} />
        ))}
      </div>
    </li>
  );
}

export default InfoRowSkeleton;

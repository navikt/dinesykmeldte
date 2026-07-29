import type { PropsWithChildren, ReactElement } from "react";

interface Props {
  loadingText: string;
}

function SkeletonRegion({
  loadingText,
  children,
}: PropsWithChildren<Props>): ReactElement {
  return (
    <>
      <p role="status" className="sr-only">
        {loadingText}
      </p>
      <div aria-hidden="true">{children}</div>
    </>
  );
}

export default SkeletonRegion;

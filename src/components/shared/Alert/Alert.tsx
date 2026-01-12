import React, { PropsWithChildren, ReactElement } from "react";
import { AlertProps, Alert as DsAlert } from "@navikt/ds-react";

interface Props extends Pick<AlertProps, "variant"> {
  id: string;
  className?: string;
}

function Alert({
  id,
  className,
  variant,
  children,
}: PropsWithChildren<Props>): ReactElement {
  return (
    <DsAlert
      className={className}
      variant={variant}
      role="status"
      aria-labelledby={id}
    >
      <div id={id}>{children}</div>
    </DsAlert>
  );
}

export default Alert;

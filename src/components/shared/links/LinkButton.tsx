import { Link } from "@navikt/ds-react";
import React, { type PropsWithChildren, type ReactElement } from "react";

interface Props {
  onClick: () => void;
}

const LinkButton = ({
  onClick,
  children,
}: PropsWithChildren<Props>): ReactElement => {
  return (
    <Link as="button" onClick={onClick}>
      {children}
    </Link>
  );
};

export default LinkButton;

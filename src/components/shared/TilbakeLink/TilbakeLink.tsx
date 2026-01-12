import React, { ReactElement } from "react";
import Link from "next/link";
import { ArrowLeftIcon } from "@navikt/aksel-icons";
import { Link as DsLink } from "@navikt/ds-react";
import { cn } from "../../../utils/tw-utils";

interface TilbakeLinkProps {
  text: string;
  marginTop?: boolean;
  marginBottom?: boolean;
  href: string;
}

function TilbakeLink({
  text,
  href,
  marginBottom = true,
  marginTop = true,
}: TilbakeLinkProps): ReactElement {
  return (
    <Link href={href} passHref legacyBehavior>
      <DsLink className={cn("", { "mb-12": marginBottom, "mt-4": marginTop })}>
        <ArrowLeftIcon role="img" aria-hidden />
        {text}
      </DsLink>
    </Link>
  );
}
export default TilbakeLink;

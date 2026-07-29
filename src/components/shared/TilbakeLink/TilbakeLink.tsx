"use client";

import { ArrowLeftIcon } from "@navikt/aksel-icons";
import { Link as DsLink } from "@navikt/ds-react";
import Link from "next/link";
import type { ReactElement } from "react";
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
  const isExternal = /^https?:\/\//.test(href);
  const className = cn("", { "mb-12": marginBottom, "mt-4": marginTop });

  if (isExternal) {
    return (
      <DsLink href={href} className={className}>
        <ArrowLeftIcon role="img" aria-hidden />
        {text}
      </DsLink>
    );
  }

  return (
    <DsLink as={Link} href={href} className={className}>
      <ArrowLeftIcon role="img" aria-hidden />
      {text}
    </DsLink>
  );
}
export default TilbakeLink;

import type { BandageIcon } from "@navikt/aksel-icons";
import {
  type ButtonProps,
  Detail,
  LinkPanel as DsLinkPanel,
} from "@navikt/ds-react";
import Link, { type LinkProps } from "next/link";
import type React from "react";
import type { ReactElement } from "react";
import { markHendelserResolved } from "../../../utils/hendelseUtils";
import { cn } from "../../../utils/tw-utils";

type LinkPanelProps = {
  /* Any icon from @navikt/aksel-icons will match this typing  */
  Icon: typeof BandageIcon;
  children: string;
  description?: React.ReactNode;
  notify?: boolean;
  detail?: string;
  tag?: React.ReactNode;
  external?: "absolute" | null;
  /** Hendelse IDs to mark as resolved when clicking the link (fire-and-forget) */
  hendelseIds?: string[];
};

export function ButtonPanel({
  onClick,
  children,
  description,
  detail,
  tag,
  notify,
  Icon,
}: Omit<LinkPanelProps, "external"> &
  Pick<ButtonProps, "onClick">): ReactElement {
  const { shouldNotify } = getNotifyOptions(notify);

  return (
    <DsLinkPanel
      as="button"
      type="button"
      // @ts-expect-error LinkPanel doesn't infer onClick type correctly when using `as`
      onClick={onClick}
      className="w-full no-underline [&>div]:flex [&>div]:w-full [&>div]:items-center"
    >
      <PanelContent
        shouldNotify={shouldNotify}
        description={description}
        detail={detail}
        tag={tag}
        Icon={Icon}
      >
        {children}
      </PanelContent>
    </DsLinkPanel>
  );
}

export function LinkPanel({
  href,
  children,
  description,
  detail,
  tag,
  notify,
  Icon,
  external = null,
  hendelseIds,
}: LinkPanelProps & Pick<LinkProps, "href">): ReactElement {
  const { shouldNotify } = getNotifyOptions(notify);

  const panel = (
    <PanelContent
      shouldNotify={shouldNotify}
      description={description}
      detail={detail}
      tag={tag}
      Icon={Icon}
    >
      {children}
    </PanelContent>
  );

  const handleClick = (): void => {
    if (hendelseIds && hendelseIds.length > 0) {
      markHendelserResolved(hendelseIds);
    }
  };

  if (external) {
    return (
      <DsLinkPanel
        className="w-full no-underline [&>div]:flex [&>div]:w-full [&>div]:items-center"
        target="_blank"
        href={href.toString()}
        rel="noopener noreferrer"
        onClick={handleClick}
      >
        {panel}
      </DsLinkPanel>
    );
  }

  return (
    <DsLinkPanel
      as={Link}
      href={href.toString()}
      className="w-full no-underline [&>div]:flex [&>div]:w-full [&>div]:items-center"
      onClick={handleClick}
    >
      {panel}
    </DsLinkPanel>
  );
}

function PanelContent({
  children,
  shouldNotify,
  description,
  detail,
  tag,
  Icon,
}: {
  shouldNotify: boolean;
} & Pick<
  LinkPanelProps,
  "children" | "description" | "detail" | "tag" | "Icon"
>): ReactElement {
  return (
    <>
      <Icon
        className={cn("mt-1 mr-4 mb-2 ml-2 h-6 w-6 min-w-6 self-start", {
          "text-ax-text-info-decoration": shouldNotify,
          "mt-2": !description,
        })}
        role="img"
        aria-hidden
      />
      <div className="flex flex-[1_0_90%] items-center justify-between text-left max-[720px]:flex max-[720px]:flex-col max-[720px]:items-start">
        <div className="flex-grow">
          {detail && <Detail>{detail}</Detail>}
          <DsLinkPanel.Title>{children}</DsLinkPanel.Title>
          {description && (
            <DsLinkPanel.Description className="mt-0">
              {description}
            </DsLinkPanel.Description>
          )}
        </div>
        {tag && <div>{tag}</div>}
      </div>
    </>
  );
}

function getNotifyOptions(notify?: boolean): {
  shouldNotify: boolean;
} {
  return { shouldNotify: notify ?? false };
}

export default LinkPanel;

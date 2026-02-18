import {
  BandageIcon,
  ChatExclamationmarkFillIcon,
  HourglassIcon,
  PersonCheckmarkIcon,
  TasklistIcon,
} from "@navikt/aksel-icons";
import type { ReactElement } from "react";
import type { PreviewSykmeldtFragment } from "../../../../../graphql/queries/graphql.generated";
import { getPeriodTime } from "../../../../../utils/sykmeldingPeriodUtils";
import { notificationCount } from "../../../../../utils/sykmeldtUtils";
import { cn } from "../../../../../utils/tw-utils";
import InfoIcon from "../../../icons/InfoIcon";
import NotifcationDot from "../../../NotifcationDot/NotifcationDot";

interface Props {
  sykmeldt: PreviewSykmeldtFragment;
  notification: boolean;
  notSentSoknad: boolean;
}

function SykmeldtIcon({
  sykmeldt,
  notification,
  notSentSoknad,
}: Props): ReactElement {
  const iconVariant = getIconVariant(sykmeldt, notification, notSentSoknad);
  const notifications = notificationCount(sykmeldt);
  const tooltip =
    notifications > 1
      ? `Du har ${notifications} uleste varsler.`
      : `Du har 1 ulest varsel.`;

  return (
    <div
      className={cn(
        "bg-ax-bg-accent-strong relative flex h-16 w-16 flex-auto items-center justify-center rounded-full border border-transparent",
        {
          "bg-ax-bg-default [&>svg]:text-ax-text-accent":
            iconVariant === "sykmeldt",
          "bg-ax-bg-default border-ax-border-neutral-subtle [&>svg]:text-ax-text-info-decoration":
            iconVariant === "notify",
          "bg-ax-bg-default [&>svg]:text-ax-text-success":
            iconVariant === "friskmeldt",
          "bg-ax-bg-info-soft [&>svg]:text-ax-text-info [&>svg]:text-2xl":
            iconVariant === "future",
          "bg-ax-bg-default": iconVariant === "notSentSoknad",
        },
      )}
    >
      <SykmeldtCardIcon variant={iconVariant} />
      {notifications > 0 && (
        <NotifcationDot notifications={notifications} tooltip={tooltip} />
      )}
    </div>
  );
}

type IconVariant =
  | "notify"
  | "sykmeldt"
  | "friskmeldt"
  | "future"
  | "notSentSoknad";

function getIconVariant(
  sykmeldt: PreviewSykmeldtFragment,
  notification: boolean,
  notSentSoknad: boolean,
): IconVariant {
  const time = getPeriodTime(sykmeldt.sykmeldinger);

  if (notification) {
    return "notify";
  } else if (notSentSoknad) {
    return "notSentSoknad";
  } else if (time === "future") {
    return "future";
  } else if (!sykmeldt.friskmeldt) {
    return "sykmeldt";
  } else {
    return "friskmeldt";
  }
}

function SykmeldtCardIcon({ variant }: { variant: IconVariant }): ReactElement {
  switch (variant) {
    case "notify":
      return (
        <ChatExclamationmarkFillIcon fontSize="2rem" role="img" aria-hidden />
      );
    case "sykmeldt":
      return <BandageIcon fontSize="2rem" role="img" aria-hidden />;
    case "friskmeldt":
      return <PersonCheckmarkIcon fontSize="2.2rem" role="img" aria-hidden />;
    case "future":
      return <HourglassIcon fontSize="2rem" role="img" aria-hidden />;
    case "notSentSoknad":
      return <NotSentSoknadIcon />;
  }
}

function NotSentSoknadIcon(): ReactElement {
  return (
    <div className="relative top-1">
      <TasklistIcon
        className="relative top-2 text-3xl"
        role="img"
        aria-hidden
      />
      <InfoIcon className="relative bottom-2 left-3" role="img" aria-hidden />
    </div>
  );
}

export default SykmeldtIcon;

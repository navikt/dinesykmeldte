import React, { type ReactElement } from "react";

interface NotifcationDotProps {
  notifications: number;
  tooltip?: string;
}

function NotifcationDot({
  notifications,
  tooltip,
}: NotifcationDotProps): ReactElement {
  return (
    <div
      className="bg-ax-bg-danger-strong text-ax-text-danger-contrast absolute right-0 bottom-0 grid h-5 w-5 place-items-center rounded-full text-sm leading-none tabular-nums"
      aria-label={tooltip ?? String(notifications)}
      role="img"
    >
      <span className="w-full text-center" aria-hidden>
        {notifications}
      </span>
    </div>
  );
}

export default NotifcationDot;

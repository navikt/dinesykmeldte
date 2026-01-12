import React, { ReactElement } from "react";

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
      className="absolute bottom-0 right-0 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-sm text-white"
      aria-label={tooltip}
      role="tooltip"
    >
      <span aria-hidden>{notifications}</span>
    </div>
  );
}

export default NotifcationDot;

import { useEffect, useRef } from "react";
import {
  type AidPaaminnelseEvent,
  recordAidPaaminnelse,
} from "../../observability/aidTelemetry";

type Decision = Omit<AidPaaminnelseEvent, "hendelse">;

/** Context is kept only in component memory, never sent to telemetry. */
export function usePaaminnelseTelemetry(
  context: string,
  decision: Decision | null,
) {
  const elementRef = useRef<HTMLElement>(null);
  const recorded = useRef({ context: "", decision: false, view: false });
  const gruppe = decision?.gruppe;
  const variant = decision?.variant;
  const paaminnelsevalg = decision?.paaminnelsevalg;
  const utfall = decision?.utfall;

  useEffect(() => {
    if (recorded.current.context !== context) {
      recorded.current = { context, decision: false, view: false };
    }
    if (!gruppe || !variant || !paaminnelsevalg || !utfall) return;
    const attributes = { gruppe, variant, paaminnelsevalg, utfall };
    if (!recorded.current.decision) {
      recorded.current.decision = true;
      recordAidPaaminnelse({ ...attributes, hendelse: "beslutning" });
    }
    if (
      variant !== "aid" ||
      recorded.current.view ||
      !elementRef.current ||
      typeof IntersectionObserver === "undefined"
    )
      return;

    const observer = new IntersectionObserver((entries) => {
      if (
        !entries.some((entry) => entry.isIntersecting) ||
        recorded.current.view ||
        recorded.current.context !== context
      )
        return;
      recorded.current.view = true;
      recordAidPaaminnelse({ ...attributes, hendelse: "vist" });
      observer.disconnect();
    });
    observer.observe(elementRef.current);
    return () => observer.disconnect();
  }, [context, gruppe, variant, paaminnelsevalg, utfall]);

  return elementRef;
}

"use client";

import { GlobalAlert, Select } from "@navikt/ds-react";
import { logger } from "@navikt/next-logger";
import { useQueryClient } from "@tanstack/react-query";
import { type ChangeEvent, useState } from "react";
import { TILTAKSPAKKEVURDERING_QUERY_KEY } from "../../services/tiltakspakke/useTiltakspakkevurdering";
import {
  DEFAULT_DEMO_SCENARIO,
  DEMO_SCENARIO_COOKIE_NAME,
  DEMO_SCENARIOS,
  type DemoScenario,
} from "../../utils/demoScenario";
import { browserEnv, isLocalOrDemo } from "../../utils/env";

const DEMO_SCENARIO_LABELS: Record<DemoScenario, string> = {
  default: "Standard",
  "tiltakspakke-1": "Tiltakspakke 1",
};

interface DemoBannerProps {
  initialDemoScenario?: DemoScenario;
}

export function DemoBanner({
  initialDemoScenario = DEFAULT_DEMO_SCENARIO,
}: DemoBannerProps) {
  const [demoScenario, setDemoScenario] = useState(initialDemoScenario);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const queryClient = useQueryClient();

  if (!isLocalOrDemo) {
    return null;
  }

  async function handleDemoScenarioChange(
    event: ChangeEvent<HTMLSelectElement>,
  ) {
    const nextScenario = event.target.value as DemoScenario;
    setDemoScenario(nextScenario);
    setIsRefreshing(true);
    // biome-ignore lint/suspicious/noDocumentCookie: Cookie Store API isn't supported everywhere; a plain session-cookie write is enough for this local/demo-only selector.
    document.cookie = `${DEMO_SCENARIO_COOKIE_NAME}=${nextScenario}; path=${browserEnv.publicPath || "/"}`;

    try {
      // Invalidate (and, since the tiltakspakke query is always mounted
      // when active, refetch) the one shared cache entry so every current
      // TanStack Query consumer picks up the new scenario without a full
      // page reload.
      await queryClient.invalidateQueries({
        queryKey: TILTAKSPAKKEVURDERING_QUERY_KEY,
      });
    } catch {
      // Fixed, non-sensitive message only: a rejected refetch can surface
      // response-parsing or network-layer detail that isn't guaranteed to
      // be PII-safe, so we never log the caught error itself.
      logger.error(
        "Failed to invalidate tiltakspakkevurdering query after demo scenario change",
      );
    } finally {
      setIsRefreshing(false);
    }
  }

  return (
    <GlobalAlert
      className="mx-auto my-8 w-4/5 max-w-4xl"
      role="status"
      status="warning"
      centered={false}
      as="div"
    >
      <GlobalAlert.Content>
        Dette er en demoside og inneholder ikke dine personlige data.
        <Select
          className="mt-4 max-w-xs"
          size="small"
          label="Demoscenario"
          value={demoScenario}
          disabled={isRefreshing}
          onChange={handleDemoScenarioChange}
        >
          {DEMO_SCENARIOS.map((scenario) => (
            <option key={scenario} value={scenario}>
              {DEMO_SCENARIO_LABELS[scenario]}
            </option>
          ))}
        </Select>
      </GlobalAlert.Content>
    </GlobalAlert>
  );
}

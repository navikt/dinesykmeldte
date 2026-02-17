import { Heading } from "@navikt/ds-react";
import React, { type ReactElement, type Ref } from "react";
import { groupBy } from "remeda";
import { formatDate } from "../../../utils/dateUtils";
import type { SykmeldteWithLatestNotifyingDate } from "../../../utils/sortByNotifying";
import ExpandableSykmeldtPanel from "../../shared/SykmeldtPanel/ExpandableSykmeldtPanel";
import { useExpanded, useExpandSykmeldte } from "../useExpandSykmeldte";

interface Props {
  sykmeldte: SykmeldteWithLatestNotifyingDate[];
  focusSykmeldtId: string | null;
  notification?: boolean;
  listLength?: number | undefined;
  lastItemRef?: Ref<HTMLDivElement> | undefined;
  showDateHeading: boolean;
}

function Sykmeldte({
  sykmeldte,
  focusSykmeldtId,
  notification = false,
  listLength,
  lastItemRef,
  showDateHeading,
}: Props): ReactElement {
  const { expandedSykmeldte, expandedSykmeldtPerioder } = useExpanded();
  const handleSykmeldtClick = useExpandSykmeldte(
    focusSykmeldtId,
    expandedSykmeldte,
  );

  const datesGrouped = Object.entries(
    groupBy(sykmeldte, (it) =>
      showDateHeading ? formatDate(it.latestDateAndText.date) : "default",
    ),
  );

  return (
    <>
      {datesGrouped.map(([group, items], groupIndex) =>
        items.map((it, index) => (
          <div
            ref={
              groupIndex === datesGrouped.length - 1 &&
              index === listLength &&
              listLength - 1
                ? lastItemRef
                : undefined
            }
            key={it.sykmeldt.narmestelederId}
          >
            {showDateHeading && index === 0 && (
              <Heading size="xsmall" level="3" spacing>
                {group}
              </Heading>
            )}
            <ExpandableSykmeldtPanel
              sykmeldt={it.sykmeldt}
              notifyingText={it.latestDateAndText.text}
              notification={notification}
              expanded={expandedSykmeldte.includes(it.sykmeldt.narmestelederId)}
              periodsExpanded={expandedSykmeldtPerioder.includes(
                it.sykmeldt.narmestelederId,
              )}
              onClick={handleSykmeldtClick}
              focusSykmeldtId={focusSykmeldtId}
              isHeadingLevel4={showDateHeading}
            />
          </div>
        )),
      )}
    </>
  );
}

export default Sykmeldte;

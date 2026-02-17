import { HGrid, Select, TextField } from "@navikt/ds-react";
import React, { type ReactElement } from "react";
import { useSelector } from "react-redux";
import { logAmplitudeEvent } from "../../amplitude/amplitude";
import type { RootState } from "../../state/store";
import { useFilterChangeHandlers } from "./useFilterChangeHandlers";
import { useIsMoreThan5SykmeldteInSelectedVirksomhet } from "./useIsMoreThan5SykmeldteInSelectedVirksomhet";

const SykmeldteFilter = (): ReactElement | null => {
  const hasMoreThan5InOrg = useIsMoreThan5SykmeldteInSelectedVirksomhet();
  const filter = useSelector((state: RootState) => state.filter);
  const { handleNameFilterChange, handleShowChange, handleSortChange } =
    useFilterChangeHandlers();

  if (!hasMoreThan5InOrg) return null;

  return (
    <section className="mb-6" aria-label="Filtrer og sorter sykmeldte">
      <HGrid gap="space-24" columns={{ md: "1.5fr 2fr 1fr" }}>
        <TextField
          hideLabel
          label="Søk på navn"
          className="self-end max-[768px]:col-span-2 max-[768px]:min-w-full"
          placeholder="Søk på navn"
          value={filter.name ?? ""}
          onChange={(event) => handleNameFilterChange(event.target.value)}
          autoComplete="off"
        />
        <Select
          label="Vis"
          value={filter.show}
          onChange={(event) => {
            handleShowChange(event.target.value);
            logAmplitudeEvent({
              eventName: "søk",
              data: { destinasjon: "vis", søkeord: event.target.value },
            });
          }}
          autoComplete="off"
        >
          <option value="all">Alle</option>
          <option value="sykmeldte">Sykmeldte</option>
          <option value="sykmeldte-per-virksomhet">
            Sykmeldte per virksomhet
          </option>
          <option value="friskmeldte">Tidligere sykmeldte</option>
          <option value="graderte">Graderte</option>
        </Select>
        <Select
          label="Sorter etter"
          value={filter.sortBy}
          onChange={(event) => {
            handleSortChange(event.target.value);
            logAmplitudeEvent({
              eventName: "søk",
              data: {
                destinasjon: "sorter etter",
                søkeord: event.target.value,
              },
            });
          }}
          autoComplete="off"
        >
          <option value="date">Dato</option>
          <option value="name">Navn</option>
        </Select>
      </HGrid>
    </section>
  );
};

export default SykmeldteFilter;

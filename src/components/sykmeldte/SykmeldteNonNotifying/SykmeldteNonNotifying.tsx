import { Heading } from "@navikt/ds-react";
import type { ReactElement } from "react";
import { useSelector } from "react-redux";
import type { PreviewSykmeldtFragment } from "../../../graphql/queries/graphql.generated";
import type { RootState } from "../../../state/store";
import SykmeldteFilter from "../../sykmeldtefilter/SykmeldteFilter";
import useFilteredSykmeldte from "../useFilteredSykmeldte";
import PaginatedSykmeldteList from "./PaginatedSykmeldteList";

interface Props {
  sykmeldte: PreviewSykmeldtFragment[];
  focusSykmeldtId: string;
}

function SykmeldteNonNotifying({
  sykmeldte,
  focusSykmeldtId,
}: Props): ReactElement {
  const filter = useSelector((state: RootState) => state.filter);
  const showOrgHeading = filter.show === "sykmeldte-per-virksomhet";

  const filteredMineSykmeldte = useFilteredSykmeldte(sykmeldte);

  return (
    <section aria-labelledby="sykmeldte-uten-varsel">
      <Heading
        id="sykmeldte-uten-varsel"
        className="sr-only"
        size="large"
        level="2"
      >
        Sykmeldte uten varsel
      </Heading>
      <SykmeldteFilter />
      <PaginatedSykmeldteList
        sykmeldte={filteredMineSykmeldte}
        focusSykmeldtId={focusSykmeldtId}
        showOrgHeading={showOrgHeading}
      />
    </section>
  );
}

export default SykmeldteNonNotifying;

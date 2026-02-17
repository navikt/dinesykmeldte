import { useQuery } from "@apollo/client";
import type { ReactElement } from "react";
import { MineSykmeldteDocument } from "../../graphql/queries/graphql.generated";
import { hasBeenSykmeldt6WeeksWithout16DaysOpphold } from "../../utils/sykmeldtUtils";
import DismissableVeileder from "../shared/veileder/DismissableVeileder";

function DialogmoteInfoPanel(): ReactElement | null {
  const { data } = useQuery(MineSykmeldteDocument);
  const hasAny6WeekSykmeldte =
    data?.mineSykmeldte?.some(hasBeenSykmeldt6WeeksWithout16DaysOpphold) ??
    false;

  if (
    !hasAny6WeekSykmeldte ||
    localStorage.getItem("personalansvar-info") !== "true"
  )
    return null;

  return (
    <DismissableVeileder
      storageKey="dialogmote-info"
      title="Har du behov for et dialogmøte?"
      text={[
        "Du kan når som helst i et sykefravær be NAV om et dialogmøte.",
        "Velg en sykmeldt du ønsker møte med, og klikk på dialogmøter.",
      ]}
    />
  );
}

export default DialogmoteInfoPanel;

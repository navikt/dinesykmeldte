import { ReactElement } from "react";
import { ClockDashedIcon } from "@navikt/aksel-icons";
import { SykmeldingFragment } from "../../graphql/queries/graphql.generated";
import { cleanId } from "../../utils/stringUtils";
import { IconHeading } from "../shared/IconHeading/IconHeading";
import SykmeldingInfoMissing from "../shared/SykmeldingInfoMissing";
import CheckboxExplanation from "../shared/checkboxexplanation/CheckboxExplanation";
import { ListItem } from "../shared/listItem/ListItem";

interface Props {
  sykmelding: SykmeldingFragment;
}

const title = "Friskmelding/Prognose";

function FriskmeldingPrognose({ sykmelding }: Props): ReactElement {
  const listItemId = cleanId(title);

  return (
    <li className="pb-4" aria-labelledby={listItemId}>
      <IconHeading
        title={title}
        headingId={listItemId}
        Icon={ClockDashedIcon}
      />
      <ul className="bg-ax-bg-neutral-soft list-none rounded px-7 py-5 print:py-0">
        <li>
          {sykmelding.arbeidsforEtterPeriode ? (
            <CheckboxExplanation text="Pasienten er 100% arbeidsfør etter denne perioden" />
          ) : (
            <SykmeldingInfoMissing text="Behandler har ikke notert om pasienten er arbeidsfør etter denne perioden" />
          )}
        </li>
        <ListItem
          title="Eventuelle hensyn som må tas på arbeidsplassen"
          text={sykmelding.hensynArbeidsplassen ?? "Ingen hensyn spesifisert"}
          headingLevel="4"
        />
      </ul>
    </li>
  );
}

export default FriskmeldingPrognose;

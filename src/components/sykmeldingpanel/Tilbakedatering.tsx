import { ReactElement } from "react";
import { ClockDashedIcon } from "@navikt/aksel-icons";
import { formatDate } from "../../utils/dateUtils";
import { cleanId } from "../../utils/stringUtils";
import { IconHeading } from "../shared/IconHeading/IconHeading";
import { ListItem } from "../shared/listItem/ListItem";

interface Props {
  kontaktDato: string | null | undefined;
}

const title = "Tilbakedatering";

function Tilbakedatering({ kontaktDato }: Props): ReactElement | null {
  const listItemId = cleanId(title);
  if (!kontaktDato) return null;

  return (
    <li className="pb-4" aria-labelledby={listItemId}>
      <IconHeading
        title={title}
        headingId={listItemId}
        Icon={ClockDashedIcon}
      />
      <ul className="list-none rounded bg-gray-50 px-7 py-5 print:py-0">
        <ListItem
          title="Dato for dokumenterbar kontakt med pasienten"
          text={formatDate(kontaktDato)}
          headingLevel="4"
        />
      </ul>
    </li>
  );
}

export default Tilbakedatering;

import { ReactElement } from "react";
import { PersonIcon } from "@navikt/aksel-icons";
import { BodyShort } from "@navikt/ds-react";
import { cleanId } from "../../utils/stringUtils";
import { fnrText } from "../../utils/sykmeldtUtils";
import { IconHeading } from "../shared/IconHeading/IconHeading";

interface Props {
  name: string;
  fnr: string;
}

const title = "Sykmeldingen gjelder";

function SykmeldingenGjelder({ name, fnr }: Props): ReactElement {
  const listItemId = cleanId(title);

  return (
    <li className="pb-4" aria-labelledby={listItemId}>
      <IconHeading title={title} headingId={listItemId} Icon={PersonIcon} />
      <ul className="list-none rounded bg-gray-50 px-7 py-5 print:py-0">
        <BodyShort as="li" size="small" className="font-semibold">
          {name}
        </BodyShort>
        <BodyShort as="li" size="small">
          {fnrText(fnr)}
        </BodyShort>
      </ul>
    </li>
  );
}

export default SykmeldingenGjelder;

import {
  EnvelopeClosedFillIcon,
  EnvelopeClosedIcon,
} from "@navikt/aksel-icons";
import type { ReactElement } from "react";
import type { AktivitetsvarselFragment } from "../../../../../graphql/queries/graphql.generated";
import LinkPanel from "../../../links/LinkPanel";

interface Props {
  sykmeldtId: string;
  aktivitetsvarsler: AktivitetsvarselFragment[];
}

const AktivitetsvarselLink = ({
  sykmeldtId,
  aktivitetsvarsler,
}: Props): ReactElement | null => {
  if (aktivitetsvarsler.length === 0) return null;

  const unreadItems = aktivitetsvarsler.filter((it) => !it.lest);

  if (unreadItems.length === 0) {
    return (
      <LinkPanel
        Icon={EnvelopeClosedIcon}
        href={`/sykmeldt/${sykmeldtId}/meldinger`}
      >
        Beskjeder
      </LinkPanel>
    );
  }

  return (
    <LinkPanel
      href={`/sykmeldt/${sykmeldtId}/meldinger`}
      Icon={EnvelopeClosedFillIcon}
      description={
        unreadItems.length === 1
          ? "Påminnelse om aktivitet"
          : `${unreadItems.length} påminnelser om aktivitet`
      }
      notify
    >
      Beskjeder
    </LinkPanel>
  );
};

export default AktivitetsvarselLink;

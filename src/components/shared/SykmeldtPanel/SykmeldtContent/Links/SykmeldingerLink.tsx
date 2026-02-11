import React, { ReactElement } from "react";
import { BandageFillIcon, BandageIcon } from "@navikt/aksel-icons";
import { PreviewSykmeldtFragment } from "../../../../../graphql/queries/graphql.generated";
import LinkPanel from "../../../links/LinkPanel";

interface Props {
  sykmeldtId: string;
  sykmeldinger: PreviewSykmeldtFragment["sykmeldinger"];
}

function SykmeldingerLink({ sykmeldtId, sykmeldinger }: Props): ReactElement {
  const unreadItems = sykmeldinger.filter((it) => !it.lest);

  if (unreadItems.length === 0) {
    return (
      <LinkPanel
        href={`/sykmeldt/${sykmeldtId}/sykmeldinger`}
        Icon={BandageIcon}
      >
        Sykmeldinger
      </LinkPanel>
    );
  }

  return (
    <LinkPanel
      href={`/sykmeldt/${sykmeldtId}/sykmeldinger`}
      Icon={BandageFillIcon}
      description={
        unreadItems.length === 1
          ? `1 ulest sykmelding`
          : `${unreadItems.length} uleste sykmeldinger`
      }
      notify
    >
      Sykmeldinger
    </LinkPanel>
  );
}

export default SykmeldingerLink;

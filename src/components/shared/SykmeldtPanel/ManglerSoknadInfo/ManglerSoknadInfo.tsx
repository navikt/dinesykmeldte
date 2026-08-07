"use client";

import { Link as DsLink, InfoCard } from "@navikt/ds-react";
import Link from "next/link";
import type { ReactElement } from "react";
import type { PreviewSoknadFragment } from "../../../../graphql/queries/graphql.generated";

interface Props {
  soknader: PreviewSoknadFragment[];
  name: string;
  sykmeldtId: string;
}

export function ManglerSoknadInfo({
  soknader,
  name,
  sykmeldtId,
}: Props): ReactElement {
  return (
    <InfoCard className="mb-4" data-color="warning">
      <InfoCard.Content>
        <DsLink as={Link} href={`/sykmeldt/${sykmeldtId}/soknader`}>
          {`Vi mangler ${soknader.length === 1 ? "1 søknad" : `${soknader.length} søknader`} fra ${
            name.split(" ")[0]
          }`}
        </DsLink>
      </InfoCard.Content>
    </InfoCard>
  );
}

import React, { ReactElement } from "react";
import Link from "next/link";
import { Link as DsLink, InfoCard } from "@navikt/ds-react";
import { PreviewSoknadFragment } from "../../../../graphql/queries/graphql.generated";

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
        <Link href={`/sykmeldt/${sykmeldtId}/soknader`} passHref legacyBehavior>
          <DsLink>
            {`Vi mangler ${soknader.length === 1 ? "1 søknad" : soknader.length + " søknader"} fra ${
              name.split(" ")[0]
            }`}
          </DsLink>
        </Link>
      </InfoCard.Content>
    </InfoCard>
  );
}

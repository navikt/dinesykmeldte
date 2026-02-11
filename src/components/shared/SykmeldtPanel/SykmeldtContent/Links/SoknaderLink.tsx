import React, { ReactElement } from "react";
import { TasklistFillIcon, TasklistIcon } from "@navikt/aksel-icons";
import { PreviewSykmeldtFragment } from "../../../../../graphql/queries/graphql.generated";
import {
  getSoknadNotifyDescription,
  isPreviewSoknadNotifying,
} from "../../../../../utils/soknadUtils";
import LinkPanel from "../../../links/LinkPanel";

interface Props {
  sykmeldtId: string;
  soknader: PreviewSykmeldtFragment["previewSoknader"];
}

function SoknaderLink({ sykmeldtId, soknader }: Props): ReactElement {
  const unreadItems = soknader.filter((it) => isPreviewSoknadNotifying(it));
  const notifyDescription = getSoknadNotifyDescription(unreadItems);

  if (unreadItems.length === 0) {
    return (
      <LinkPanel href={`/sykmeldt/${sykmeldtId}/soknader`} Icon={TasklistIcon}>
        Søknader
      </LinkPanel>
    );
  }

  return (
    <LinkPanel
      href={`/sykmeldt/${sykmeldtId}/soknader`}
      Icon={TasklistFillIcon}
      description={
        notifyDescription?.length === 1 ? (
          notifyDescription
        ) : (
          <ul className="my-0 list-disc pl-4">
            {notifyDescription?.map((description: string) => (
              <li key={description}>{description}</li>
            ))}
          </ul>
        )
      }
      notify
    >
      Søknader
    </LinkPanel>
  );
}

export default SoknaderLink;

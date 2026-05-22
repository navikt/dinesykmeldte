import { TasklistFillIcon, TasklistIcon } from "@navikt/aksel-icons";
import type { ReactElement } from "react";
import type { OppfolgingsplanFragment } from "../../../../../graphql/queries/graphql.generated";
import { getOppfolgingsplanUrl } from "../../../../../hooks/getOppfolgingsplanUrl";
import LinkPanel from "../../../links/LinkPanel";
import LinkMessageList from "./LinkMessageList";

interface Props {
  sykmeldtId: string;
  oppfolgingsplaner: OppfolgingsplanFragment[];
}

const OppfolgingsplanLink = ({
  sykmeldtId,
  oppfolgingsplaner,
}: Props): ReactElement => {
  const oppfolgingsplanUrl = getOppfolgingsplanUrl({
    narmestelederId: sykmeldtId,
  });

  if (!oppfolgingsplaner.length) {
    return (
      <LinkPanel Icon={TasklistIcon} href={oppfolgingsplanUrl}>
        Oppfølgingsplaner
      </LinkPanel>
    );
  }

  return (
    <LinkPanel
      Icon={TasklistFillIcon}
      href={oppfolgingsplanUrl}
      hendelseIds={oppfolgingsplaner.map((it) => it.hendelseId)}
      notify
      description={<LinkMessageList items={oppfolgingsplaner} />}
    >
      Oppfølgingsplaner
    </LinkPanel>
  );
};

export default OppfolgingsplanLink;

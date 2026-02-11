import { ReactElement } from "react";
import { TasklistFillIcon, TasklistIcon } from "@navikt/aksel-icons";
import { OppfolgingsplanFragment } from "../../../../../graphql/queries/graphql.generated";
import { getOppfolgingsplanUrl } from "../../../../../hooks/getOppfolgingsplanUrl";
import LinkPanel from "../../../links/LinkPanel";
import LinkMessageList from "./LinkMessageList";

interface Props {
  sykmeldtId: string;
  pilotUser: boolean;
  oppfolgingsplaner: OppfolgingsplanFragment[];
}

const OppfolgingsplanLink = ({
  sykmeldtId,
  pilotUser,
  oppfolgingsplaner,
}: Props): ReactElement => {
  const oppfolgingsplanUrl = getOppfolgingsplanUrl({
    narmestelederId: sykmeldtId,
    pilotUser,
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

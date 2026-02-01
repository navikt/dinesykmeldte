import { ReactElement } from "react";
import { TasklistFillIcon, TasklistIcon } from "@navikt/aksel-icons";
import { OppfolgingsplanFragment } from "../../../../../graphql/queries/graphql.generated";
import { useOppfolgingsplanUrl } from "../../../../../hooks/useOppfolgingsplanUrl";
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
  const oppfolgingsplanUrl = useOppfolgingsplanUrl({
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
      notify={{
        notify: true,
        disableWarningBackground: true,
      }}
      description={<LinkMessageList items={oppfolgingsplaner} />}
    >
      Oppfølgingsplaner
    </LinkPanel>
  );
};

export default OppfolgingsplanLink;

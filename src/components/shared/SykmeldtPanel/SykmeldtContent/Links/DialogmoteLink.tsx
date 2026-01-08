import { ReactElement } from "react";
import { Chat2FillIcon, Chat2Icon } from "@navikt/aksel-icons";
import { DialogmoteFragment } from "../../../../../graphql/queries/graphql.generated";
import { browserEnv } from "../../../../../utils/env";
import LinkPanel from "../../../links/LinkPanel";
import LinkMessageList from "./LinkMessageList";

interface Props {
  sykmeldtId: string;
  dialogmoter: DialogmoteFragment[];
}

const DialogmoteLink = ({ sykmeldtId, dialogmoter }: Props): ReactElement => {
  const dialogmoterUrl = `${browserEnv.dialogmoteUrl}/${sykmeldtId}`;

  if (!dialogmoter.length) {
    return (
      <LinkPanel Icon={Chat2Icon} href={dialogmoterUrl}>
        Dialogmøter
      </LinkPanel>
    );
  }

  return (
    <LinkPanel
      Icon={Chat2FillIcon}
      href={dialogmoterUrl}
      hendelseIds={dialogmoter.map((it) => it.hendelseId)}
      notify={{
        notify: true,
        disableWarningBackground: true,
      }}
      description={<LinkMessageList items={dialogmoter} />}
    >
      Dialogmøter
    </LinkPanel>
  );
};

export default DialogmoteLink;

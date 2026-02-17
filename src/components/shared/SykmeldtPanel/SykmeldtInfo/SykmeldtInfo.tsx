import { useApolloClient, useMutation } from "@apollo/client";
import {
  Buildings2Icon,
  PersonIcon,
  PersonPencilIcon,
} from "@navikt/aksel-icons";
import { BodyLong, Button, Modal } from "@navikt/ds-react";
import { logger } from "@navikt/next-logger";
import { type ReactElement, useCallback, useState } from "react";
import {
  MineSykmeldteDocument,
  type PreviewSykmeldtFragment,
  UnlinkSykmeldtDocument,
} from "../../../../graphql/queries/graphql.generated";
import { fnrText } from "../../../../utils/sykmeldtUtils";
import LinkButton from "../../links/LinkButton";
import { InfoItem } from "./InfoItem";

interface Props {
  sykmeldt: PreviewSykmeldtFragment;
}

function SykmeldtInfo({ sykmeldt }: Props): ReactElement {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const onClose = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  return (
    <>
      {/* biome-ignore lint/a11y/useSemanticElements: role="group" is appropriate for grouped information */}
      <div
        className="border-ax-border-neutral-subtle bg-ax-bg-neutral-soft mb-6 flex justify-between rounded border p-5 max-[600px]:flex-col max-[600px]:[&>div:not(:last-of-type)]:pb-4"
        aria-label={`Informasjon om ${sykmeldt.navn}`}
        role="group"
      >
        <InfoItem
          title="Fødselsnummer"
          text={fnrText(sykmeldt.fnr, false)}
          Icon={PersonIcon}
          id={sykmeldt.fnr}
        />
        <InfoItem
          title={sykmeldt.orgnavn}
          text={`Org.nummer: ${sykmeldt.orgnummer}`}
          Icon={Buildings2Icon}
          id={sykmeldt.fnr}
        />
        <InfoItem
          title="Ikke din ansatt?"
          text={
            <LinkButton
              onClick={() => {
                setIsModalOpen(true);
              }}
            >
              Fjern fra min oversikt
            </LinkButton>
          }
          Icon={PersonPencilIcon}
          id={sykmeldt.fnr}
        />
      </div>
      <UnlinkModal
        sykmeldt={sykmeldt}
        isModalOpen={isModalOpen}
        onClose={onClose}
      />
    </>
  );
}

interface UnlinkModalProps {
  isModalOpen: boolean;
  onClose: (wasCancelled: boolean) => void;
  sykmeldt: PreviewSykmeldtFragment;
}

function UnlinkModal({
  isModalOpen,
  onClose,
  sykmeldt,
}: UnlinkModalProps): ReactElement {
  const apolloClient = useApolloClient();
  const [unlinkSykmeldt, { loading }] = useMutation(UnlinkSykmeldtDocument, {
    refetchQueries: [{ query: MineSykmeldteDocument }],
    awaitRefetchQueries: true,
  });

  const handleOnCancelled = (): void => onClose(true);
  const handleOnUnlinkClick = useCallback(
    () =>
      unlinkSykmeldt({
        variables: { sykmeldtId: sykmeldt.narmestelederId },
        onCompleted: (_data, clientOptions) => {
          // Debug: Trying to see if refetch is still containing the unlinked sykmeldt
          const mineSykmeldteQueryData = apolloClient.readQuery({
            query: MineSykmeldteDocument,
          });
          const removedSykmeldtId = clientOptions?.variables?.sykmeldtId;

          if (removedSykmeldtId) {
            const removedSykmeldtStillInSykmeldte = clientOptions.variables
              ?.sykmeldtId
              ? mineSykmeldteQueryData?.mineSykmeldte?.find(
                  (it) => it.narmestelederId === removedSykmeldtId,
                )
              : null;
            if (removedSykmeldtStillInSykmeldte) {
              logger.error(
                `Sykmeldt with id ${clientOptions.variables?.sykmeldtId} was still in sykmeldte list after refetch`,
              );
            }
          }

          // This is not debug
          onClose(false);
        },
      }),
    [unlinkSykmeldt, sykmeldt.narmestelederId, apolloClient, onClose],
  );

  return (
    <Modal
      open={isModalOpen}
      onClose={handleOnCancelled}
      header={{
        heading: "Meld fra om endring",
        icon: <PersonPencilIcon />,
      }}
    >
      <Modal.Body className="max-w-md">
        <BodyLong>
          {
            "Er du sikker på at du ikke lenger skal være registrert som leder for "
          }
          <b>{sykmeldt.navn}</b>
          {`? Dersom ${sykmeldt.navn} fortsatt er ansatt i din virksomhet, vil det 
                    bli sendt ny forespørsel om å oppgi nærmeste leder i Altinn.`}
        </BodyLong>
      </Modal.Body>
      <Modal.Footer>
        <Button
          data-color="danger"
          variant="primary"
          onClick={handleOnUnlinkClick}
          loading={loading}
        >
          Ja, fjern fra min oversikt
        </Button>
        <Button variant="secondary" onClick={handleOnCancelled}>
          Avbryt
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default SykmeldtInfo;

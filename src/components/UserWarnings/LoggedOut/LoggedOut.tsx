import React, { ReactElement } from "react";
import { useSelector } from "react-redux";
import { BodyLong, Button, Modal } from "@navikt/ds-react";
import { RootState } from "../../../state/store";

function LoggedOut(): ReactElement {
  const loggedOut = useSelector((state: RootState) => state.metadata.loggedOut);

  return (
    <Modal
      open={loggedOut}
      onClose={(e) => e.preventDefault()}
      onCancel={(e) => e.preventDefault()}
      header={{
        heading: "Du har blitt logget ut",
        closeButton: false,
      }}
    >
      <Modal.Body className="max-w-lg">
        <BodyLong spacing>
          Av sikkerhetsmessige årsaker blir du automatisk logget ut av Dine
          Sykmeldte etter èn time.
        </BodyLong>
        <BodyLong spacing>Logg inn på nytt for å fortsette.</BodyLong>
      </Modal.Body>
      <Modal.Footer>
        <Button
          variant="primary"
          onClick={() => {
            // Redirect to allow SSR authentication to redirect to login
            window.location.reload();
          }}
        >
          Logg inn på nytt
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default LoggedOut;

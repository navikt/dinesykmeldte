import { Button } from "@navikt/ds-react";
import { type ReactElement, useCallback, useState } from "react";
import MarkAllAsReadModal from "./MarkAllAsReadModal";

function MarkAllAsRead(): ReactElement | null {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const onCloseModal = useCallback((_wasCancelled: boolean) => {
    setIsModalOpen(false);
  }, []);

  return (
    <>
      <Button
        className="mb-6 ml-6 mt-16 self-end max-[530px]:ml-2 max-[530px]:mt-0"
        variant="tertiary"
        onClick={() => {
          setIsModalOpen(true);
        }}
      >
        Merk varsler som lest
      </Button>
      <MarkAllAsReadModal isModalOpen={isModalOpen} onClose={onCloseModal} />
    </>
  );
}

export default MarkAllAsRead;

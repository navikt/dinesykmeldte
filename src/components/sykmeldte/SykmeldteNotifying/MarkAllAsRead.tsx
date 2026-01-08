import { ReactElement, useCallback, useState } from "react";
import { Button } from "@navikt/ds-react";
import { logAmplitudeEvent } from "../../../amplitude/amplitude";
import MarkAllAsReadModal from "./MarkAllAsReadModal";

function MarkAllAsRead(): ReactElement | null {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const onCloseModal = useCallback((wasCancelled: boolean) => {
    setIsModalOpen(false);
    if (wasCancelled) {
      logAmplitudeEvent({
        eventName: "modal lukket",
        data: {
          tekst:
            "Marker alle sykmeldinger og søknader varsler som lest: avbryt",
        },
      });
    } else {
      logAmplitudeEvent({
        eventName: "modal lukket",
        data: {
          tekst:
            "Marker alle sykmeldinger og søknader varsler som lest: markert",
        },
      });
    }
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

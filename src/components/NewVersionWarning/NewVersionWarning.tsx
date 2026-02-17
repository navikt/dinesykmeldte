import { GlobalAlert, Link } from "@navikt/ds-react";
import type { ReactElement } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../../state/store";

const NewVersionWarning = (): ReactElement | null => {
  const stale = useSelector((state: RootState) => state.metadata.stale);

  if (!stale) return null;

  return (
    <GlobalAlert
      className="mb-4"
      status="announcement"
      size="small"
      role="status"
      aria-live="polite"
      as="div"
    >
      <GlobalAlert.Content>
        Det har kommet en ny versjon av nettsiden. Trykk her{" "}
        <Link href={window.location.pathname}>for å laste nyeste versjon</Link>.
      </GlobalAlert.Content>
    </GlobalAlert>
  );
};

export default NewVersionWarning;

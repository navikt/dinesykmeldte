import { Loader } from "@navikt/ds-react";
import type { ReactElement } from "react";

interface Props {
  text: string;
}

const PageFallbackLoader = ({ text }: Props): ReactElement => {
  return (
    <div className="flex h-24 items-center justify-center">
      <Loader aria-label={text} title={text} size="2xlarge" />
    </div>
  );
};

export default PageFallbackLoader;

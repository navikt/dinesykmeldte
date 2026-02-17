import type { PropsWithChildren, ReactElement } from "react";
import TilbakeLink from "../../shared/TilbakeLink/TilbakeLink";
import { Veileder } from "../../shared/veileder/Veileder";
import TimelineIcon, { type Icons } from "./TimelineIcon";

function Timeline({ children }: PropsWithChildren<unknown>): ReactElement {
  return (
    <div>
      <TilbakeLink text="Tilbake til Dine sykmeldte" href="/" />
      <Veileder
        text={[
          "Her ser du hva som er forventet av deg underveis i et sykefravær, og hva du kan forvente av den ansatte. ",
          "Det kan gjøres unntak fra enkelte av aktivitetene hvis den ansatte er for syk.",
          "Tidspunktene kan også endres hvis det er behov for det.",
        ]}
      />
      {children}
      <TilbakeLink text="Tilbake til Dine sykmeldte" href="/" marginTop />
    </div>
  );
}

export function TimelineEntry({
  children,
  icon,
  last = false,
}: PropsWithChildren<{ icon: Icons; last: boolean }>): ReactElement {
  return (
    <div className="relative mb-16 flex">
      <div>
        <TimelineIcon className="mx-4 h-6 w-6" icon={icon} />
        {!last && (
          <div className="absolute left-7 top-7 h-24 w-px bg-border-default" />
        )}
      </div>
      {children}
    </div>
  );
}

export default Timeline;

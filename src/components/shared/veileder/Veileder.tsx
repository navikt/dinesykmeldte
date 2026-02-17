import { BodyLong, GuidePanel, Heading } from "@navikt/ds-react";
import type { PropsWithChildren, ReactElement, ReactNode } from "react";
import { cn } from "../../../utils/tw-utils";
import styles from "./Veileder.module.css";

interface Props {
  title?: string;
  text?: string | string[];
  illustration?: ReactNode;
  veilederMerInfo?: boolean;
}

export function Veileder({
  children,
  title,
  text,
  illustration,
  veilederMerInfo,
}: PropsWithChildren<Props>): ReactElement {
  return (
    <GuidePanel
      className={cn(
        "mx-12 max-w-2xl print:hidden",
        styles.veileder,
        styles.noBorder,
        {
          [styles.centerContent]: !veilederMerInfo,
        },
      )}
      illustration={illustration}
      aria-label="Veiledende informasjon"
      role="article"
    >
      <VeilederBody title={title} text={text} />
      {children}
    </GuidePanel>
  );
}

export function VeilederBorder({
  children,
  title,
  text,
  illustration,
}: PropsWithChildren &
  Pick<Props, "title" | "text" | "illustration">): ReactElement {
  return (
    <GuidePanel
      className="mb-12 print:hidden"
      illustration={illustration}
      aria-label="Veiledende informasjon"
      role="article"
    >
      <VeilederBody title={title} text={text} />
      {children}
    </GuidePanel>
  );
}

function VeilederBody({
  title,
  text,
}: Pick<Props, "title" | "text">): ReactElement {
  return (
    <>
      {title && (
        <Heading level="2" size="small" spacing>
          {title}
        </Heading>
      )}
      {typeof text === "string" ? (
        <BodyLong className="leading-normal">{text}</BodyLong>
      ) : (
        text?.map(
          (it, index) =>
            it !== "" && (
              <BodyLong
                key={it}
                className={cn("leading-normal", {
                  "mb-3": index !== text.length - 1,
                })}
              >
                {it}
              </BodyLong>
            ),
        )
      )}
    </>
  );
}

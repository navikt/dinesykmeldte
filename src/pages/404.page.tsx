import React, { ReactElement } from "react";
import { useRouter } from "next/router";
import { Page } from "@navikt/ds-react";
import PageError from "../components/shared/errors/PageError";
import LinkButton from "../components/shared/links/LinkButton";
import { useUpdateBreadcrumbs } from "../hooks/useBreadcrumbs";

function NotFound(): ReactElement | boolean {
  const router = useRouter();
  useUpdateBreadcrumbs(() => [{ title: "Ukjent side" }]);

  return (
    <Page>
      <Page.Block width="md" gutters>
        <PageError
          graphic="mom"
          noReload
          text="Siden du leter etter finnes ikke"
          cause="Page not found (404)"
          details={
            <ul className="list-inside list-disc">
              <li>
                Skrev du inn adressen direkte kan du se om den er stavet riktig.
              </li>
              <li>Klikket du på en lenke er den feil eller utdatert.</li>
              <li>
                <LinkButton onClick={() => router.back()}>
                  Gå tilbake
                </LinkButton>{" "}
                til den forrige siden eller
              </li>
            </ul>
          }
          action={null}
        />
      </Page.Block>
    </Page>
  );
}

export default NotFound;

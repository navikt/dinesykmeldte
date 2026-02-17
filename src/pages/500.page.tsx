import { Page } from "@navikt/ds-react";
import React, { type ReactElement } from "react";
import PageError from "../components/shared/errors/PageError";
import { useUpdateBreadcrumbs } from "../hooks/useBreadcrumbs";

function Error(): ReactElement | boolean {
  useUpdateBreadcrumbs(() => [{ title: "Ukjent feil" }]);

  return (
    <Page>
      <Page.Block width="md" gutters>
        <PageError noReload cause="Internal server error (500)" />
      </Page.Block>
    </Page>
  );
}

export default Error;

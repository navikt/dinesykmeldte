import { PersonGroupIcon } from "@navikt/aksel-icons";
import { PageContainer } from "@navikt/dinesykmeldte-sidemeny";
import dynamic from "next/dynamic";
import Head from "next/head";
import type React from "react";
import type { ReactElement } from "react";
import { withAuthenticatedPage } from "../auth/withAuthentication";
import NarmestelederInfo from "../components/NarmestelederInfo/NarmestelederInfo";
import SykmeldteInfoPanel from "../components/SykmeldtInfoPanel/SykmeldteInfoPanel";
import SykmeldteList from "../components/sykmeldte/SykmeldteList";
import VirksomhetPicker from "../components/virksomhetpicker/VirksomhetPicker";
import {
  createSsrApolloClient,
  prefetchMutlipleQueries,
  wrapProps,
} from "../graphql/prefetching";
import {
  MineSykmeldteDocument,
  VirksomheterDocument,
} from "../graphql/queries/graphql.generated";
import { useUpdateBreadcrumbs } from "../hooks/useBreadcrumbs";
import type { GetServerSidePropsPrefetchResult } from "../shared/types";

const DialogmoteInfoPanel: React.ComponentType = dynamic(
  () => import("../components/DialogmoteInfoPanel/DialogmoteInfoPanel"),
  {
    ssr: false,
  },
);

function Home(): ReactElement {
  useUpdateBreadcrumbs(() => []);

  return (
    <PageContainer
      header={{ Icon: PersonGroupIcon, title: "Dine sykmeldte" }}
      headerRight={<VirksomhetPicker />}
    >
      <Head>
        <title>Dine sykmeldte - nav.no</title>
      </Head>
      <SykmeldteInfoPanel />
      <DialogmoteInfoPanel />
      <SykmeldteList />
      <NarmestelederInfo />
    </PageContainer>
  );
}

export const getServerSideProps = withAuthenticatedPage(
  async (context, version, isIE): Promise<GetServerSidePropsPrefetchResult> => {
    const client = createSsrApolloClient(context.req);

    if (context.req.url?.startsWith("/_next")) {
      // When navigating to root on the client side, don't SSR-fetch queries again
      return { props: { version, isIE } };
    }

    await prefetchMutlipleQueries([
      client.query({ query: MineSykmeldteDocument }),
      client.query({ query: VirksomheterDocument }),
    ]);

    return {
      props: wrapProps(client, version, isIE),
    };
  },
);

export default Home;

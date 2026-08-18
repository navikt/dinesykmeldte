import { type Pages, SideMenu } from "@navikt/dinesykmeldte-sidemeny";
import Link from "next/link";
import type { ReactElement } from "react";
import type { PreviewSykmeldtFragment } from "../../graphql/queries/graphql.generated";
import { getOppfolgingsplanUrl } from "../../hooks/getOppfolgingsplanUrl";

type Props = {
  sykmeldt: PreviewSykmeldtFragment | null;
  activePage: Pages;
};

function PageSideMenu({ sykmeldt, activePage }: Props): ReactElement | null {
  if (!sykmeldt) return null;

  const oppfolgingsplanUrl = getOppfolgingsplanUrl({
    narmestelederId: sykmeldt.narmestelederId,
  });

  return (
    <SideMenu
      sykmeldtId={sykmeldt.narmestelederId}
      sykmeldtName={sykmeldt.navn}
      activePage={activePage}
      routes={{
        Sykmeldinger: {
          // TODO: Notifications are disabled for all routes until eSyfo decides how they want to handle notifications
          // notifications: sykmeldt.sykmeldinger.filter((it) => !it.lest).length,
          notifications: 0,
          internalRoute: ({ children, ...rest }) => (
            <Link
              {...rest}
              href={`/sykmeldt/${sykmeldt.narmestelederId}/sykmeldinger`}
              scroll={false}
            >
              {children}
            </Link>
          ),
        },
        Soknader: {
          // notifications: sykmeldt.previewSoknader.filter((it) => isPreviewSoknadNotification(it)).length,
          notifications: 0,
          internalRoute: ({ children, ...rest }) => (
            <Link
              {...rest}
              href={`/sykmeldt/${sykmeldt.narmestelederId}/soknader`}
              scroll={false}
            >
              {children}
            </Link>
          ),
        },
        Meldinger: {
          hide: sykmeldt.aktivitetsvarsler.length === 0,
          // notifications: sykmeldt.aktivitetsvarsler.filter((it) => !it.lest).length,
          notifications: 0,
          internalRoute: ({ children, ...rest }) => (
            <Link
              {...rest}
              href={`/sykmeldt/${sykmeldt.narmestelederId}/meldinger`}
              scroll={false}
            >
              {children}
            </Link>
          ),
        },
        // Dialogmoter: sykmeldt.dialogmoter.length,
        Dialogmoter: 0,
        Oppfolgingsplaner: {
          notifications: 0,
          internalRoute: ({ children, ...rest }) => (
            <a {...rest} href={oppfolgingsplanUrl}>
              {children}
            </a>
          ),
        },
        DineSykmeldte: {
          notifications: 0,
          internalRoute: ({ children, ...rest }) => (
            <Link {...rest} href="/" scroll={false}>
              {children}
            </Link>
          ),
        },
      }}
    />
  );
}

export default PageSideMenu;

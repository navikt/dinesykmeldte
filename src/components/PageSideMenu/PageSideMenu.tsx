import { type Pages, SideMenu } from "@navikt/dinesykmeldte-sidemeny";
import Link from "next/link";
import type { ReactElement } from "react";
import { logAmplitudeEvent } from "../../amplitude/amplitude";
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
    pilotUser: sykmeldt.pilotUser,
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
              href={`/sykmeldt/${sykmeldt.narmestelederId}/sykmeldinger`}
              passHref
              legacyBehavior
              scroll={false}
            >
              {/* biome-ignore lint/a11y/noStaticElementInteractions: onClick is for analytics tracking, navigation handled by Next.js Link */}
              <a
                {...rest}
                // biome-ignore lint/a11y/useValidAnchor: This is a navigation link with Next.js Link, onClick is for analytics only
                onClick={() => {
                  logAmplitudeEvent(
                    {
                      eventName: "navigere",
                      data: {
                        lenketekst: "Sykmeldinger",
                        destinasjon: "/sykmeldinger",
                      },
                    },
                    { sidemeny: true },
                  );
                }}
              >
                {children}
              </a>
            </Link>
          ),
        },
        Soknader: {
          // notifications: sykmeldt.previewSoknader.filter((it) => isPreviewSoknadNotification(it)).length,
          notifications: 0,
          internalRoute: ({ children, ...rest }) => (
            <Link
              href={`/sykmeldt/${sykmeldt.narmestelederId}/soknader`}
              passHref
              legacyBehavior
              scroll={false}
            >
              {/* biome-ignore lint/a11y/noStaticElementInteractions: onClick is for analytics tracking, navigation handled by Next.js Link */}
              <a
                {...rest}
                // biome-ignore lint/a11y/useValidAnchor: onClick is for analytics only, navigation handled by Next.js Link
                onClick={() => {
                  logAmplitudeEvent(
                    {
                      eventName: "navigere",
                      data: {
                        lenketekst: "Søknader",
                        destinasjon: "/soknader",
                      },
                    },
                    { sidemeny: true },
                  );
                }}
              >
                {children}
              </a>
            </Link>
          ),
        },
        Meldinger: {
          hide: sykmeldt.aktivitetsvarsler.length === 0,
          // notifications: sykmeldt.aktivitetsvarsler.filter((it) => !it.lest).length,
          notifications: 0,
          internalRoute: ({ children, ...rest }) => (
            <Link
              href={`/sykmeldt/${sykmeldt.narmestelederId}/meldinger`}
              passHref
              legacyBehavior
              scroll={false}
            >
              {/* biome-ignore lint/a11y/noStaticElementInteractions: onClick is for analytics tracking, navigation handled by Next.js Link */}
              <a
                {...rest}
                // biome-ignore lint/a11y/useValidAnchor: onClick is for analytics only, navigation handled by Next.js Link
                onClick={() => {
                  logAmplitudeEvent(
                    {
                      eventName: "navigere",
                      data: {
                        lenketekst: "Aktivitetsvarsler",
                        destinasjon: "/meldinger",
                      },
                    },
                    { sidemeny: true },
                  );
                }}
              >
                {children}
              </a>
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
            <Link href="/" passHref legacyBehavior scroll={false}>
              {/* biome-ignore lint/a11y/noStaticElementInteractions: onClick is for analytics tracking, navigation handled by Next.js Link */}
              <a
                {...rest}
                // biome-ignore lint/a11y/useValidAnchor: onClick is for analytics only, navigation handled by Next.js Link
                onClick={() => {
                  logAmplitudeEvent(
                    {
                      eventName: "navigere",
                      data: { lenketekst: "Dine Sykmeldte", destinasjon: "/" },
                    },
                    { sidemeny: true },
                  );
                }}
              >
                {children}
              </a>
            </Link>
          ),
        },
      }}
    />
  );
}

export default PageSideMenu;

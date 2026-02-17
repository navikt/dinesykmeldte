import type { ReactElement } from "react";
import { browserEnv } from "../../../utils/env";

const UnsupportedBrowser = (): ReactElement => {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        fontFamily: "sans-serif",
        padding: "16px",
        maxWidth: "700px",
        margin: "0 auto",
      }}
    >
      {/* biome-ignore lint/performance/noImgElement: Legacy IE warning component, not worth converting to Next Image */}
      <img
        alt="NAV veileder som forteller deg at Internet Explorer ikke er støttet"
        src={`${browserEnv.cdnPublicPath}/ie/hekkan-i-godstolen.png`}
      />
      <div>
        <h4>Vi støtter ikke Internet Explorer</h4>
        <p>For å bruke Dine Sykmeldte må du bruke en nyere nettleser.</p>
        <a href="https://www.nav.no/no/nav-og-samfunn/kontakt-nav/teknisk-brukerstotte/hjelp-til-personbruker/elektronisk-innsending_kap">
          Se mer informasjon.
        </a>
      </div>
    </div>
  );
};

export default UnsupportedBrowser;

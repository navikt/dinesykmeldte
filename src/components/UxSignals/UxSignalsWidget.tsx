import React, { ReactElement } from "react";
import Script from "next/script";
import { browserEnv } from "../../utils/env";
import styles from "./UxSignalsWidget.module.css";

function UxSignalsWidget(): ReactElement | null {
  if (browserEnv.runtimeEnv !== "prod") return null;

  return (
    <>
      <Script
        type="module"
        strategy="lazyOnload"
        src="https://uxsignals-frontend.uxsignals.app.iterate.no/embed.js"
      />
      <div
        data-uxsignals-embed="study-0s1mp8nu4t"
        className={styles.uxSignalsContainer}
      />
    </>
  );
}

export default UxSignalsWidget;

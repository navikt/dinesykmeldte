"use client";

import ReactDOM from "react-dom";

export default function Preload() {
  ReactDOM.preload("https://cdn.nav.no/aksel/fonts/SourceSans3-normal.woff2", {
    as: "font",
    type: "font/woff2",
    crossOrigin: "anonymous",
  });

  return null;
}

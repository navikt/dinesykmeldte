#!/usr/bin/env node
/**
 * Starts the local prototype surface for sykefraværsoppfølging.
 * Design exploration only — mock data, in-memory state, no production calls.
 */
import { spawn } from "node:child_process";

const PORT = process.env.PORT ?? "3000";
const URL = `http://localhost:${PORT}/prototype`;

const banner = [
  "",
  "  ┌─────────────────────────────────────────────────┐",
  "  │  Prototyper — sykefraværsoppfølging             │",
  "  │  Fiktive data. Ingenting lagres, sendes         │",
  "  │  eller varsles.                                 │",
  "  └─────────────────────────────────────────────────┘",
  "",
  `  Åpne:  ${URL}`,
  "",
].join("\n");

console.log(banner);

const next = spawn("next", ["dev", "--port", PORT], {
  stdio: "inherit",
  shell: true,
});

let opened = false;
const openBrowser = () => {
  if (opened) return;
  opened = true;
  const opener =
    process.platform === "darwin"
      ? "open"
      : process.platform === "win32"
        ? "start"
        : "xdg-open";
  spawn(opener, [URL], {
    stdio: "ignore",
    shell: true,
    detached: true,
  }).unref();
};

setTimeout(openBrowser, 5000);

next.on("exit", (code) => process.exit(code ?? 0));

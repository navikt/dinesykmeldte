---
description: "Standalone image contract for dinesykmeldte"
applyTo: "Dockerfile, .dockerignore"
---

# Application image

The root `Dockerfile` packages a Next.js standalone build on Nav's Chainguard
Node 24 runtime. CI builds the application before packaging; preserve that
contract instead of adding a second build stage by default. Inspect the
current `COPY` entries, static/public assets and runtime port before edits.

Keep the runtime image non-root and copy only the required build artifacts.
Do not copy the whole checkout, secrets or development dependencies into the
final image. Keep `.dockerignore` aligned with the actual build context.
Changes to the base image, privileges or secret handling need a resolved
security decision; use the current Dockerfile and build workflow as evidence.

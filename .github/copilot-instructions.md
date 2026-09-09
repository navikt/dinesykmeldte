# dinesykmeldte

Next.js app showing employers their sykmeldte employees. Owned by Team eSyfo (`navikt`).

## Source map

`src/app/` owns routes. `src/auth/` owns authentication, `src/services/` backend contracts, and `src/graphql/` and `src/queries/` GraphQL integration. Use `pnpm run gen` for the existing code-generation flow.

## Commands

Use the pnpm version in `package.json` and the committed lockfile.
The scripts in `package.json` and existing CI define the build/test contract.

```sh
pnpm run dev
pnpm run test
pnpm run lint
pnpm run build
```

## Frontend conventions

- TypeScript and Aksel are the existing UI foundation; inspect package versions
  and nearby components before selecting APIs or patterns.
- Prefer Aksel components and semantic spacing/color tokens. Preserve responsive
  behavior, keyboard navigation, visible focus and accessible form errors.
- English code and comments; Norwegian user-facing text and established domain
  terms. Format numbers and dates with an explicit Norwegian locale.
- Cover changed application behavior, including loading, errors and empty
  states. Do not duplicate upstream Aksel component tests.
- Keep changes within the requested scope. New dependencies, custom layout
  conventions, and changes to authentication or data-fetching strategy need a
  resolved decision within the task.

## Runtime and data

Deployment and environment-specific access policies live in `nais/`. Keep authentication and token exchange on the server; inspect the existing implementation and manifests before changing the flow.
Never expose tokens, personal data or response payloads in logs, fixtures,
screenshots or committed documentation.

## Repository guidance

This repository owns its instructions, local specialists and issue/PR templates.
Update these files with verified repository facts when an authorized change
makes them stale. Shared agent roles and skills come from the selected
Grillmester plugin through nav-pilot; do not copy them into `.github/` or add a
file-sync workflow. Use the active client's catalog for exact callable IDs.

Keep temporary plans and scratch output out of version control. Put durable
repository documentation in the existing README or an appropriate `docs/`
page; preserve the established layout and keep current task state separate.

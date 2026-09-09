---
description: "Frontend boundaries for dinesykmeldte"
applyTo: "src/**/*.{ts,tsx,js,jsx}"
---

# Frontend contract

`src/app/` is the routing surface; preserve server/client component boundaries and current server-side data access.
`package.json` and the lockfile own framework and Aksel versions. Use existing
TypeScript types, validation helpers and component patterns. Do not infer
package APIs or import a pattern from a different frontend.

Prefer Aksel components and semantic tokens. Preserve existing responsive
layouts, loading/error/empty states and explicit Norwegian number/date
formatting. Keep Tailwind exceptions consistent with the local Aksel rules.
Test application behavior through the existing test setup; do not duplicate
upstream component tests or add a survey/authentication dependency by default.

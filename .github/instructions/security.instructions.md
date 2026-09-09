---
description: "Security boundaries for dinesykmeldte"
applyTo: "**"
---

# Repository security boundaries

Deployment and access policies are in `nais/`; authentication follows the existing server-side code, not assumptions about other Nav applications.

- Never commit secrets or log tokens, headers, personal identifiers or complete
  request/response payloads.
- Validate external input at the existing system boundary. Keep token exchange
  and credentials out of browser code.
- Preserve explicit access policies and least privilege. Resolve material
  changes to authentication, exposed data or permissions before implementing.
- For SQL-bearing code or examples, use parameterized queries.
- Synthetic fixtures must remain synthetic; do not copy production data to
  tests, screenshots, prompts or documentation.

---
description: "Repository workflow contracts and permissions for dinesykmeldte"
applyTo: ".github/workflows/**"
---

# Workflow contract for dinesykmeldte

`.github/workflows/build-and-deploy.yml` is the existing verification entry point.
Application build/deploy and Dependabot flows use the existing Team eSyfo reusable workflow contracts. Inspect their actual `uses` and `with` values before changing caller inputs.

- Keep third-party actions pinned to full commit SHAs, with version comments;
  follow the established explicit policy for internal `nais/*` actions.
- Set minimal job permissions, bounded timeouts and the appropriate existing
  concurrency group. Never use `permissions: write-all` or log secrets.
- Do not check out an untrusted PR head in a privileged `pull_request_target`
  workflow. Keep validation on `pull_request` and `merge_group` where required.
- Check protected status names before renaming or deleting jobs. Branch rules
  are separate administration and are not changed by editing workflow YAML.
- New secrets, reusable workflow contracts or deployment ordering require a
  resolved decision within the task.

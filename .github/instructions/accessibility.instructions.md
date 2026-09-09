---
description: "Accessibility requirements for dinesykmeldte"
applyTo: "src/**/*.{ts,tsx,js,jsx}"
---

# Accessibility requirements

WCAG 2.1 AA is the repository's existing accessibility baseline. Use Aksel
components where they cover the interaction, semantic HTML, logical headings,
visible labels and descriptive link text. Keep visible keyboard focus and
accessible names, including icon buttons. Do not use color as the only signal.

Connect validation errors to fields and preserve understandable loading,
empty, error and success states. For new forms, modals or changed keyboard/focus
behavior, verify the rendered flow with keyboard and appropriate accessibility
tools; record what was tested. A custom ARIA pattern or replacing an Aksel
component requires a resolved design decision. Never replace a button with an
inaccessible click handler or remove focus indication without an equivalent.

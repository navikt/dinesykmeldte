# Serverlogging

Ved feilgrenser på serveren (API-ruter, GraphQL-resolvere, autentisering
og tjenester) logges feil som typede WARN- og ERROR-hendelser i
`src/observability/serverLog.ts`, sendt gjennom `createLogger` fra
`@navikt/esyfo-logger` til den eksisterende `@navikt/next-logger`.
Hendelsen binder `event_type`, `operation`, nivå og fast melding.
Frie tekstlogger andre steder er ennå ikke migrert.
Vanlige informasjonslogger er ikke feilhendelser.

## Hvem logger?

Klienter og tjenester sender feil videre med avgrensede felt som
`upstream_status` og `failure_stage`. Grensen som eier utfallet logger én
gang med `logServerFailure`; den sender aldri feilobjektet til loggeren.
Tjenester som returnerer en degradert verdi, for eksempel
tiltakspakkevurdering og påminnelsesstatus, eier selv den loggen.

GraphQL-resolveren `withBackendFailure` logger backendfeil og kaster en
trygg `GraphQLError` med `extensions.serverLogged: true`.
`errorLink` og kallere som `mark-hendelser-resolved` logger ikke den
feilen på nytt. En feil som ikke er merket, logges av ruten som eier svaret.

## Diagnostikk

Bruk bare felt med vurderte, avgrensede verdier:

- `failure_stage`: request, response, response_parse,
  response_validation, token_exchange, authentication eller configuration.
- `failure_kind`: dns, timeout, tls, connection, http, invalid_response,
  token, configuration eller unknown. Uklassifiserte feilobjekter er
  `unknown`; uten feilobjekt utledes ingen nettverksårsak.
- `error_code`: gjenkjent transportkode eller fast utfallskode.
  For `tiltakspakkevurdering_lookup_failed` er den alltid en
  `RuntimeErrorCode`; transport-/diagnosekoden går i `cause_code`.
- `upstream`, `upstream_status`, `cause_type` og `outcome` kan beskrive
  eier, HTTP-status, kjent feiltype og failed/degraded/rejected.

HTTP-status fra 400 gir `UPSTREAM_HTTP_ERROR`; en uventet status under
400 i response-steg gir `UPSTREAM_UNEXPECTED_STATUS`. Parse- og
valideringssteg går foran statusklassifisering. Et eksplisitt vurdert
kontekstfelt kan overstyre en utledet verdi.

Avviste API-forespørsler som skal logges, bruker `logRequestRejected`
og bibliotekets `apiRequestRejected`: WARN med `event_type:
api_request_rejected`, fast `operation` og `rejection_reason`.
Ingen verdier fra forespørselen følger med.

Logg aldri tokens, pid/fnr, orgnummer, navn, request-/response-body,
URL-er med persondata, feilmeldinger, rå feilobjekter, `err` eller stack.
Kopier bare godkjente diagnosefelt fra feil og deres causes.
Test med faktisk serialisering gjennom `backendLogger`: kontroller
hendelsens felter og antall linjer, og at canary-verdier, sensitive
felt og `logging_context_invalid` ikke finnes i utdata.

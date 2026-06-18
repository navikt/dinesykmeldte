# Påminnelse om oppfølgingsplan — ønsket backend-kontrakt

Forslag til kontrakten dinesykmeldte (BFF) ønsker seg fra
`syfo-oppfolgingsplan-backend` (Kotlin/Ktor). BFF-adapteren i denne mappa er
allerede skrevet mot kontrakten under, så dette dokumentet beskriver hva
backend må levere for at den skal virke.

## Prinsipp

Påminnelsen gjelder **én narmesteleder-relasjon** (sykmeldt × leder × org), og
`narmestelederId` er allerede den unike, ugjenkjennelige nøkkelen for nettopp
den kombinasjonen. Vi sender derfor kun `narmestelederId` — ikke fnr/orgnummer.
To grunner:

1. **Mindre PII på tvers av tjenester.** `narmestelederId` er en ugjennomsiktig
   id (ligger allerede i URL-en på dinesykmeldte), mens fnr er sensitivt og ikke
   hører hjemme i URL/logg.
2. **Ren REST.** Med id-en i path blir status en ekte `GET` (ingen body, ingen
   «POST for å lese»), og bestille/avbestille blir `POST`/`DELETE` på samme
   ressurs.

OBO-tokenet BFF veksler inn bærer **leders pid**. Backend vet altså alltid
*hvem* lederen er fra tokenet; BFF forteller bare *hvilken relasjon* via
`narmestelederId`.

## Endepunkter

| Verb     | Path                                              | Betydning  |
| -------- | ------------------------------------------------- | ---------- |
| `GET`    | `/api/oppfolgingsplan/paaminnelse/{narmestelederId}` | hent status |
| `POST`   | `/api/oppfolgingsplan/paaminnelse/{narmestelederId}` | bestill    |
| `DELETE` | `/api/oppfolgingsplan/paaminnelse/{narmestelederId}` | avbestill  |

- **Input:** `narmestelederId` i path. Ingen request-body i fase 1 (heller ikke
  på `POST` — leder velger ikke tidspunkt ennå).
- **Output:** alle tre returnerer samme `PaaminnelseStatusDto` (se under).
- **Headere fra BFF:** `Authorization: Bearer <OBO>`, `Nav-Call-Id`,
  `x-request-id`, `Nav-Consumer-Id: dinesykmeldte`.

## Backendens ansvar

1. Slå opp `narmestelederId` → relasjon (leder-fnr, sykmeldt-fnr, orgnummer).
2. **Autoriser:** `relasjon.leder == token.pid`, ellers `403`. Ukjent id ⇒ `404`
   (eller `403` for ikke å avsløre eksistens).
3. Beregn status ut fra oppfølgingsplan-domenet (se neste avsnitt).

## Statusmodell

Ett felt, tre verdier. Backend eier hele avgjørelsen om hva som skal vises:

| Status        | Betydning                                                |
| ------------- | -------------------------------------------------------- |
| `SKJULT`      | skal ikke vises — utenfor tidsvindu, plan finnes, e.l.   |
| `TILGJENGELIG`| kan bestilles, ikke bestilt ennå                         |
| `BESTILT`     | påminnelse er aktiv                                       |

«Skal den vises» (tidsvindu, finnes det allerede en plan, kvalifiserer
relasjonen) er en **beregning på backend**, ikke et eget felt på wiren. Vi
bruker bevisst *ikke* et separat `synlig: boolean` + `bestilt: boolean`, fordi
kombinasjonen `synlig=false, bestilt=true` er meningsløs for klienten — én enum
gjør den ulovlige tilstanden urepresenterbar, og klienten slipper å sette
sammen to felter selv.

Trenger vi senere å skille *hvorfor* noe er skjult (ulik UI per årsak), legges
det til som et valgfritt `reason`-felt da — uten å røre de tre statusene.

**Returverdi per verb:**

- `GET` → nåværende status
- `POST` → `BESTILT` (idempotent: bestiller du på nytt, får du `BESTILT`)
- `DELETE` → `TILGJENGELIG`

## Dataklasser (Kotlin)

```kotlin
@Serializable
enum class PaaminnelseStatus {
    SKJULT,
    TILGJENGELIG,
    BESTILT,
}

@Serializable
data class PaaminnelseStatusDto(
    val status: PaaminnelseStatus,
)
```

Ingen request-dataklasse i fase 1 (`narmestelederId` er path, body er tom).
Innfører dere leder-valgt tidspunkt senere, legges en `BestillPaaminnelseRequest`
til da.

## Feilkoder → hva BFF gjør

BFF eksponerer aldri backend-meldinger videre; den mapper HTTP-status til et
fast, PII-fritt feilkode-sett. Lesing **fail-closer** til `SKJULT`, skriving
**fail-loud**.

| Backend-respons                                | BFF gjør                                                              |
| ---------------------------------------------- | -------------------------------------------------------------------- |
| `200` + gyldig DTO                             | returnerer status som den er                                         |
| alt annet — `4xx`/`5xx`, timeout, ugyldig body | GET: fail-closer til `SKJULT`; skriv: `502 BESTILLING_FEILET` / `AVBESTILLING_FEILET` |

BFF skiller **ikke** på backend-statuskode — all non-2xx behandles likt. Siden
leder-autorisering allerede er gjort i BFF før kallet, er en `403`/`404` fra
backend en uventet defense-in-depth-tilstand som overflatebehandles som `502`
(server-feil), ikke videreført som `403`.

Tidsbudsjett mot backend i BFF er 3 s; bruk gjerne samme størrelsesorden.

# dinesykmeldte

Frontend for visning over sykmeldte medarbeiderne og tilhørende informasjon og tjenester
som skal hjelpe deg med oppfølgingen av ein sykmeldt.

Lever under:

-   prod-gcp: https://www.nav.no/arbeidsgiver/sykmeldte
-   dev-gcp: https://www-gcp.dev.nav.no/arbeidsgiver/sykmeldte
-   dev-gcp (demo): https://dinesykmeldte.ekstern.dev.nav.no/arbeidsgiver/sykmeldte/

Bygget på [nextjs](https://nextjs.org/).

## lokal utvikling
### Tilgang til Github Package Registry

Siden vi bruker avhengigheter som ligger i GPR, 
så må man sette opp tilgang til GPR med en PAT (personal access token) 
som har `read:packages`. Du kan [opprette PAT her](https://github.com/settings/tokens).
Dersom du har en PAT som du bruker for tilgang til maven-packages i github kan du gjenbruke denne.

I din `.bashrc` eller `.zshrc`, sett følgende miljøvariabel:

`export NPM_AUTH_TOKEN=<din PAT med read:packages>`

Installer dependencies og start appen i dev-modus

1. `yarn`
2. `yarn start`

## produksjonsbygg

Installer dependencies, bygg appen, og start i produksjonsmodus.

1. `yarn`
2. `yarn build`
3. `yarn start:prod`

## dirty-deploy

Dersom man implementerer noe som er avhengig av skyen, og ikke vil vente på
Github Actions byggene for å deploye, kan man bruke `./dirty-deploy.sh`, med noen forbehold.

### Forbehold

1. Skal KUN brukes mot dev-miljø.
2. Ingen andre kan se at du deployer, så bruk det med omhu, og informer team-medlemmer om at dev vil være utilgjengelig.
3. Husk å kjør et vanlig bygg så dev blir lik master når du er ferdig

### Deploy

1. Koble til naisdevice
2. `kubectl config use-context dev-gcp`
3. `gcloud auth login`
4. `./dirty-deploy.sh` - Kan gjentas flere ganger uten stegen over når de først er gjort.

## Test-miljø

[www-gcp.dev.nav.no/arbeidsgiver/sykmeldte](https://www-gcp.dev.nav.no/arbeidsgiver/sykmeldte) nås lokalt dersom man er pålogget Naisdevice.

### Kontakt/spørsmål

Prosjektet er vedlikeholdt av [teamsykmelding](CODEOWNERS)

Spørsmål og/eller feature requests? Vennligst lag ein [issue](https://github.com/navikt/dinesykmeldte/issues)

Dersom du jobber i [@navikt](https://github.com/navikt) kan du nå oss på slack
kanalen [#team-sykmelding](https://nav-it.slack.com/archives/CMA3XV997)
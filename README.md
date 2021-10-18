# dinesykmeldte

Bygget på [nextjs](https://nextjs.org/).

## lokal utvikling

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

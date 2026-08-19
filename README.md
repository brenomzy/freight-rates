# Freight Rates

Freight Rates is a JavaScript coding test based on the initial assignment document provided by Digital Sparks. The project uses their developer starter and adds custom functionality to an existing Webflow rate calculator interface.

## Project goal

The calculator allows visitors to:

- Select valid origin and destination locations with Google Places autocomplete
- Choose a cargo container type
- Select a ready date
- Choose one or more transport modes
- Validate the form and open the results page with the selected values as URL parameters

The implementation is also expected to support duplicated calculator modules, keyboard operation, synchronized values between instances, and a date picker styled for the Webflow project.

## Status

Complete and prepared for the `v1.0.0` release.

Staging: [digital-sparks-freight-rates.webflow.io](https://digital-sparks-freight-rates.webflow.io/)

QA checklist: [Google Sheets](https://docs.google.com/spreadsheets/d/1eZZ4VVhBVuLS1bbHtM7finlJDgHMwZmX58NIGL8Fxpg/edit)

## Requirements

- Node.js 20 or newer
- pnpm 10.26 or newer
- Access to the related Webflow project

## Local development

Install the dependencies:

```bash
pnpm install
```

Start the development server:

```bash
pnpm dev
```

The development bundle is served from `http://localhost:3000/index.js`. Open the [Webflow staging site in local mode](https://digital-sparks-freight-rates.webflow.io/?staging=true) to load it during development. Local mode is active only while `staging=true` is present in the URL. Remove the parameter to load the published staging bundle from the CDN.

The Google Maps browser key is supplied at runtime by `window.FREIGHT_RATES_CONFIG` in the Webflow page head. It is not stored in this repository or the generated bundle. See [the Webflow DOM contract](docs/webflow-dom-contract.md#runtime-configuration) for the required snippet.

## Quality checks

Run these commands before committing a change:

```bash
pnpm lint
pnpm check
pnpm test
pnpm build
```

## Project structure

```text
src/       JavaScript source files and component controllers
dist/      Release bundle loaded by Webflow
bin/       Starter build and development scripts
tests/     Automated unit and DOM tests
docs/      Webflow integration contract
```

The page coordinator creates one store and one controller for each rate module root. Every controller subscribes to the same store, which keeps duplicated modules synchronized while all DOM queries remain scoped to their own component. The selectors and required Webflow hooks are documented in [docs/webflow-dom-contract.md](docs/webflow-dom-contract.md).

## Starter documentation

This repository was created from the official [Digital Sparks developer starter](https://github.com/digital-sparks/developer-starter). Its original technical guides remain available for reference:

- [Development setup](DEVELOPMENT_SETUP.md)
- [Build configuration](SETUP.md)
- [Deployment options](DEPLOYMENT.md)

The project-specific Webflow contract and runtime configuration are documented in [docs/webflow-dom-contract.md](docs/webflow-dom-contract.md). The automated suite and shared QA checklist cover the functional requirements, accessibility checks, responsive behavior, and known environment limitations.

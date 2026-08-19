# Webflow DOM Contract

The JavaScript uses stable custom attributes as its public integration contract with Webflow. Current Webflow names and classes remain as temporary fallbacks so the module keeps working while the attributes are added.

## Module hooks

| Element | Custom attribute | Current fallback |
| --- | --- | --- |
| Module root | `data-rate-module` | `.rate-module_component` |
| Form | `data-rate-form` | Descendant `form` |
| Origin input | `data-rate-input="origin"` | `input[name="cargo_origin"]` |
| Destination input | `data-rate-input="destination"` | `input[name="cargo_destination"]` |
| Cargo input | `data-rate-input="cargo"` | `input[name="cargo_type"]` |
| Hidden cargo select | `data-rate-options="cargo"` | `select[name="cargo_type"]` |
| Ready date input | `data-rate-input="ready-date"` | `input[name="cargo_date"]` |
| Sea checkbox | `data-rate-mode="sea"` | `input[name="cargo_option_sea"]` |
| Air checkbox | `data-rate-mode="air"` | `input[name="cargo_option_air"]` |
| Train checkbox | `data-rate-mode="rail"` | `input[name="cargo_option_train"]` |
| Calculate link | `data-rate-submit` | `[data-button-click][href]` |

## Dropdown and error hooks

Add these attributes to the existing styled elements inside each field:

| Field | Suggestion list | Option template | Error message |
| --- | --- | --- | --- |
| Origin | `data-rate-list="origin"` | `data-rate-option-template="origin"` | `data-rate-error="origin"` |
| Destination | `data-rate-list="destination"` | `data-rate-option-template="destination"` | `data-rate-error="destination"` |
| Cargo | `data-rate-list="cargo"` | `data-rate-option-template="cargo"` | `data-rate-error="cargo"` |
| Ready date | Not applicable | Not applicable | `data-rate-error="ready-date"` |

The transport group also needs one error element using the existing `.cargo_field-error` style and the text `Select at least one transport option`. Add `data-rate-error="transport"` to that element.

## Rules for duplicated modules

- Every query starts from one module root.
- Do not use unique IDs as JavaScript selectors because Webflow duplicates them with the component.
- Reuse the same attributes in every duplicated module.
- The shared store synchronizes values, while open dropdowns and focused options remain local to each module.
- Project-authored CSS lives in one page-level Webflow Embed instead of being bundled with the JavaScript.

## Current staging notes

- Staging URL: `https://digital-sparks-freight-rates.webflow.io/`
- Calculate base path: `/calculator`
- Sea is checked in the published Webflow markup and is also enforced by the initial JavaScript state.
- The hidden cargo select contains all five required labels and values.
- All documented field, dropdown, option-template, transport, submit, and error hooks are published.
- Flatpickr's official structural stylesheet is loaded in the page head. Project-authored calendar styles remain in the Webflow CSS Embed.

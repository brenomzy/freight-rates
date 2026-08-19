export const RATE_MODULE_SELECTOR = '[data-rate-module], .rate-module_component';

const SELECTORS = Object.freeze({
  form: '[data-rate-form], form',
  originInput: '[data-rate-input="origin"], input[name="cargo_origin"]',
  destinationInput: '[data-rate-input="destination"], input[name="cargo_destination"]',
  cargoInput: '[data-rate-input="cargo"], input[name="cargo_type"]',
  cargoOptions: '[data-rate-options="cargo"], select[name="cargo_type"]',
  readyDateInput: '[data-rate-input="ready-date"], input[name="cargo_date"]',
  seaInput: '[data-rate-mode="sea"], input[name="cargo_option_sea"]',
  airInput: '[data-rate-mode="air"], input[name="cargo_option_air"]',
  railInput: '[data-rate-mode="rail"], input[name="cargo_option_train"]',
  submit: '[data-rate-submit], [data-button-click][href]',
});

function queryRequired(root, selector, name) {
  const element = root.querySelector(selector);

  if (!element) {
    throw new Error(`[rate-module] Missing ${name}. Expected: ${selector}`);
  }

  return element;
}

function findFieldElement(root, input, dataSelector, fallbackSelector) {
  return (
    root.querySelector(dataSelector) ??
    input.closest('.cargo_field')?.querySelector(fallbackSelector)
  );
}

function getFieldElements(root, input, name) {
  return {
    input,
    list: findFieldElement(root, input, `[data-rate-list="${name}"]`, '.form_dropdown-list'),
    optionTemplate: findFieldElement(
      root,
      input,
      `[data-rate-option-template="${name}"]`,
      '.form_dropdown-link'
    ),
    error: findFieldElement(root, input, `[data-rate-error="${name}"]`, '.cargo_field-error'),
  };
}

export function getRateModuleRoots(scope = document) {
  return Array.from(scope.querySelectorAll(RATE_MODULE_SELECTOR));
}

export function getRateModuleElements(root) {
  const originInput = queryRequired(root, SELECTORS.originInput, 'origin input');
  const destinationInput = queryRequired(root, SELECTORS.destinationInput, 'destination input');
  const cargoInput = queryRequired(root, SELECTORS.cargoInput, 'cargo input');
  const readyDateInput = queryRequired(root, SELECTORS.readyDateInput, 'ready date input');

  return {
    root,
    form: queryRequired(root, SELECTORS.form, 'form'),
    fields: {
      origin: getFieldElements(root, originInput, 'origin'),
      destination: getFieldElements(root, destinationInput, 'destination'),
      cargo: {
        ...getFieldElements(root, cargoInput, 'cargo'),
        options: queryRequired(root, SELECTORS.cargoOptions, 'cargo options'),
      },
      readyDate: {
        input: readyDateInput,
        error: findFieldElement(
          root,
          readyDateInput,
          '[data-rate-error="ready-date"]',
          '.cargo_field-error'
        ),
      },
    },
    transport: {
      sea: queryRequired(root, SELECTORS.seaInput, 'sea checkbox'),
      air: queryRequired(root, SELECTORS.airInput, 'air checkbox'),
      rail: queryRequired(root, SELECTORS.railInput, 'train checkbox'),
      error: root.querySelector('[data-rate-error="transport"]'),
    },
    submit: queryRequired(root, SELECTORS.submit, 'calculate link'),
  };
}

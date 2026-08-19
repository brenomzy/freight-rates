import { describe, expect, it } from 'vitest';

import { initRateModules } from '../src/rate-module/init-rate-modules.js';

function getModuleMarkup() {
  return `
    <div class="rate-module_component">
      <form>
        <div class="cargo_field">
          <input name="cargo_origin" />
          <div class="form_dropdown-list"><div class="form_dropdown-link"></div></div>
          <div class="cargo_field-error"></div>
        </div>
        <div class="cargo_field">
          <input name="cargo_destination" />
          <div class="form_dropdown-list"><div class="form_dropdown-link"></div></div>
          <div class="cargo_field-error"></div>
        </div>
        <div class="cargo_field">
          <input name="cargo_type" />
          <select name="cargo_type"><option value="HC_40">High cube</option></select>
          <div class="form_dropdown-list"><div class="form_dropdown-link"></div></div>
          <div class="cargo_field-error"></div>
        </div>
        <div class="cargo_field">
          <input name="cargo_date" />
          <div class="cargo_field-error"></div>
        </div>
        <input name="cargo_option_sea" type="checkbox" />
        <input name="cargo_option_air" type="checkbox" checked />
        <input name="cargo_option_train" type="checkbox" checked />
        <a data-button-click href="/calculator">Calculate</a>
      </form>
    </div>
  `;
}

describe('rate module initialization', () => {
  it('connects every module to one shared store', () => {
    const scope = document.createElement('main');
    scope.innerHTML = `${getModuleMarkup()}${getModuleMarkup()}`;

    const initialization = initRateModules(scope);

    expect(initialization.controllers).toHaveLength(2);

    initialization.controllers.forEach(({ elements }) => {
      expect(elements.transport.sea.checked).toBe(true);
      expect(elements.transport.air.checked).toBe(false);
      expect(elements.transport.rail.checked).toBe(false);
    });

    initialization.store.patchState({ transportModes: ['air', 'rail'] });

    initialization.controllers.forEach(({ elements }) => {
      expect(elements.transport.sea.checked).toBe(false);
      expect(elements.transport.air.checked).toBe(true);
      expect(elements.transport.rail.checked).toBe(true);
    });
  });

  it('does not initialize the same scope twice', () => {
    const scope = document.createElement('main');
    scope.innerHTML = getModuleMarkup();

    expect(initRateModules(scope)).toBe(initRateModules(scope));
  });
});

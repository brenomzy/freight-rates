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
          <input data-rate-input="cargo" name="cargo_type" />
          <select data-rate-options="cargo" name="cargo_type">
            <option value="STD_DRY_20">20' standard dry container</option>
            <option value="STD_DRY_40">40' standard dry container</option>
            <option value="HC_40">40' high cube container</option>
            <option value="FCL">Other FCL</option>
            <option value="LCL">Other LCL</option>
          </select>
          <div data-rate-list="cargo" class="form_dropdown-list">
            <div data-rate-option-template="cargo" class="form_dropdown-link">
              <div class="form_input-text"></div>
              <div class="form_input-text-xs"></div>
            </div>
          </div>
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

    initialization.destroy();
  });

  it('does not initialize the same scope twice', () => {
    const scope = document.createElement('main');
    scope.innerHTML = getModuleMarkup();

    const initialization = initRateModules(scope);

    expect(initialization).toBe(initRateModules(scope));

    initialization.destroy();
  });

  it('populates cargo options and synchronizes a pointer selection', () => {
    const scope = document.createElement('main');
    scope.innerHTML = `${getModuleMarkup()}${getModuleMarkup()}`;

    const initialization = initRateModules(scope);
    const cargoInputs = scope.querySelectorAll('[data-rate-input="cargo"]');
    const cargoLists = scope.querySelectorAll('[data-rate-list="cargo"]');

    expect(cargoLists[0].querySelectorAll('[role="option"]')).toHaveLength(5);
    expect(cargoInputs[0].value).toBe('');

    cargoInputs[0].click();

    expect(cargoInputs[0].getAttribute('aria-expanded')).toBe('true');
    expect(cargoLists[0].hidden).toBe(false);

    cargoLists[0].querySelectorAll('[role="option"]')[2].click();

    expect(initialization.store.getState().cargo).toEqual({
      label: "40' high cube container",
      value: 'HC_40',
    });
    expect(cargoInputs[0].value).toBe("40' high cube container");
    expect(cargoInputs[1].value).toBe("40' high cube container");
    expect(cargoInputs[0].getAttribute('aria-expanded')).toBe('false');

    initialization.destroy();
  });

  it('supports keyboard cargo selection and synchronized transport changes', () => {
    const scope = document.createElement('main');
    scope.innerHTML = `${getModuleMarkup()}${getModuleMarkup()}`;

    const initialization = initRateModules(scope);
    const cargoInputs = scope.querySelectorAll('[data-rate-input="cargo"]');
    const airInputs = scope.querySelectorAll('input[name="cargo_option_air"]');
    const seaInputs = scope.querySelectorAll('input[name="cargo_option_sea"]');

    cargoInputs[1].dispatchEvent(new window.KeyboardEvent('keydown', { key: 'ArrowDown' }));
    cargoInputs[1].dispatchEvent(new window.KeyboardEvent('keydown', { key: 'ArrowDown' }));
    cargoInputs[1].dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Enter' }));

    expect(cargoInputs[0].value).toBe("40' standard dry container");
    expect(cargoInputs[1].getAttribute('aria-expanded')).toBe('false');

    airInputs[0].checked = true;
    airInputs[0].dispatchEvent(new window.Event('change'));

    expect(initialization.store.getState().transportModes).toEqual(['sea', 'air']);
    expect(airInputs[1].checked).toBe(true);

    seaInputs[1].checked = false;
    seaInputs[1].dispatchEvent(new window.Event('change'));

    expect(initialization.store.getState().transportModes).toEqual(['air']);
    expect(seaInputs[0].checked).toBe(false);

    initialization.destroy();
  });

  it('keeps the ready date read-only and synchronizes the display value', () => {
    const scope = document.createElement('main');
    scope.innerHTML = `${getModuleMarkup()}${getModuleMarkup()}`;

    const initialization = initRateModules(scope);
    const dateInputs = scope.querySelectorAll('[name="cargo_date"]');

    expect(dateInputs[0].readOnly).toBe(true);
    expect(dateInputs[0].getAttribute('aria-haspopup')).toBe('dialog');

    initialization.store.patchState({ readyDate: '2026-11-15' });

    expect(dateInputs[0].value).toBe('15-11-2026');
    expect(dateInputs[1].value).toBe('15-11-2026');

    initialization.destroy();
  });
});

import { describe, expect, it, vi } from 'vitest';

import { initRateModules } from '../src/rate-module/init-rate-modules.js';

function getModuleMarkup() {
  return `
    <div data-rate-module class="rate-module_component">
      <form data-rate-form>
        <div class="cargo_field">
          <input data-rate-input="origin" name="cargo_origin" />
          <div data-rate-list="origin" class="form_dropdown-list">
            <div data-rate-option-template="origin" class="form_dropdown-link"></div>
          </div>
          <div data-rate-error="origin" class="cargo_field-error"></div>
        </div>
        <div class="cargo_field">
          <input data-rate-input="destination" name="cargo_destination" />
          <div data-rate-list="destination" class="form_dropdown-list">
            <div data-rate-option-template="destination" class="form_dropdown-link"></div>
          </div>
          <div data-rate-error="destination" class="cargo_field-error"></div>
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
          <div data-rate-error="cargo" class="cargo_field-error"></div>
        </div>
        <div class="cargo_field">
          <input data-rate-input="ready-date" name="cargo_date" />
          <div data-rate-error="ready-date" class="cargo_field-error"></div>
        </div>
        <div class="rate_checkbox-wrapper">
          <input data-rate-mode="sea" name="cargo_option_sea" type="checkbox" />
          <input data-rate-mode="air" name="cargo_option_air" type="checkbox" checked />
          <input data-rate-mode="rail" name="cargo_option_train" type="checkbox" checked />
        </div>
        <div data-rate-error="transport" class="cargo_field-error"></div>
        <a data-rate-submit data-button-click href="/calculator">Calculate</a>
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

    cargoInputs[1].dispatchEvent(new window.KeyboardEvent('keydown', { key: 'ArrowDown' }));
    cargoInputs[1].dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Escape' }));

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

  it('shows validation errors, clears corrected fields, and builds the redirect', () => {
    const scope = document.createElement('main');
    const navigate = vi.fn();

    scope.innerHTML = getModuleMarkup();

    const initialization = initRateModules(scope, { navigate });
    const submit = scope.querySelector('[data-rate-submit]');
    const originInput = scope.querySelector('[data-rate-input="origin"]');
    const seaInput = scope.querySelector('[data-rate-mode="sea"]');
    const originFocus = vi.spyOn(originInput, 'focus');
    const seaFocus = vi.spyOn(seaInput, 'focus');

    submit.click();

    expect(navigate).not.toHaveBeenCalled();
    expect(scope.querySelector('[data-rate-error="origin"]').hidden).toBe(false);
    expect(scope.querySelector('[data-rate-error="destination"]').hidden).toBe(false);
    expect(scope.querySelector('[data-rate-error="cargo"]').hidden).toBe(false);
    expect(scope.querySelector('[data-rate-error="ready-date"]').hidden).toBe(false);
    expect(scope.querySelector('[data-rate-error="transport"]').hidden).toBe(true);
    expect(originInput.getAttribute('aria-invalid')).toBe('true');
    expect(originFocus).toHaveBeenCalledOnce();

    originInput.value = 'R';
    originInput.dispatchEvent(new window.Event('input'));

    expect(scope.querySelector('[data-rate-error="origin"]').hidden).toBe(true);

    initialization.store.patchState({
      origin: {
        inputValue: 'Rotterdam, Netherlands',
        label: 'Rotterdam, Netherlands',
        placeId: 'origin-place',
      },
      destination: {
        inputValue: 'Shanghai, China',
        label: 'Shanghai, China',
        placeId: 'destination-place',
      },
      cargo: { label: "40' high cube container", value: 'HC_40' },
      readyDate: '2099-11-15',
      transportModes: [],
    });

    submit.click();

    expect(navigate).not.toHaveBeenCalled();
    expect(scope.querySelector('[data-rate-error="transport"]').hidden).toBe(false);
    expect(seaFocus).toHaveBeenCalledOnce();

    initialization.store.patchState({ transportModes: ['sea', 'air'] });

    expect(scope.querySelectorAll('[data-rate-error]:not([hidden])')).toHaveLength(0);

    submit.click();

    expect(navigate).toHaveBeenCalledOnce();

    const redirect = new URL(navigate.mock.calls[0][0]);

    expect(redirect.pathname).toBe('/calculator');
    expect(Object.fromEntries(redirect.searchParams)).toEqual({
      containerType: 'HC_40',
      destination: 'Shanghai, China',
      origin: 'Rotterdam, Netherlands',
      transportDate: '2099-11-15',
      transportMode: 'sea,air',
    });

    initialization.destroy();
  });
});

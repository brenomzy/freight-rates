import { afterEach, describe, expect, it, vi } from 'vitest';

import { createLocationField } from '../src/rate-module/fields/location-field.js';
import { createRateModuleStore } from '../src/rate-module/store.js';

function createField() {
  const wrapper = document.createElement('div');

  wrapper.className = 'cargo_field';
  wrapper.innerHTML = `
    <input />
    <div class="form_dropdown-list">
      <div class="form_dropdown-link">
        <span class="form_input-text"></span>
        <span class="form_input-text-xs"></span>
      </div>
    </div>
  `;

  return {
    input: wrapper.querySelector('input'),
    list: wrapper.querySelector('.form_dropdown-list'),
    optionTemplate: wrapper.querySelector('.form_dropdown-link'),
  };
}

function createSuggestion(label, placeId) {
  return { label, placeId, value: placeId };
}

afterEach(() => {
  vi.useRealTimers();
});

describe('location field', () => {
  it('searches after two characters, selects a result, and invalidates edited text', async () => {
    vi.useFakeTimers();

    const store = createRateModuleStore();
    const firstField = createField();
    const secondField = createField();
    const placesService = {
      createSessionToken: vi.fn().mockResolvedValue({ id: 'session' }),
      getSuggestions: vi
        .fn()
        .mockResolvedValue([createSuggestion('Rotterdam, Netherlands', 'rotterdam-id')]),
    };
    const firstController = createLocationField('origin', firstField, store, placesService, 'one');
    const secondController = createLocationField(
      'origin',
      secondField,
      store,
      placesService,
      'two'
    );
    const unsubscribe = store.subscribe((state) => {
      firstController.render(state.origin);
      secondController.render(state.origin);
    });

    firstField.input.value = 'R';
    firstField.input.dispatchEvent(new window.Event('input'));

    expect(placesService.getSuggestions).not.toHaveBeenCalled();

    firstField.input.value = 'Ro';
    firstField.input.dispatchEvent(new window.Event('input'));
    await vi.advanceTimersByTimeAsync(300);

    expect(placesService.getSuggestions).toHaveBeenCalledWith('Ro', { id: 'session' });
    expect(firstField.list.querySelectorAll('[role="option"]')).toHaveLength(1);

    firstField.list.querySelector('[role="option"]').click();

    expect(store.getState().origin).toEqual({
      inputValue: 'Rotterdam, Netherlands',
      label: 'Rotterdam, Netherlands',
      placeId: 'rotterdam-id',
    });
    expect(secondField.input.value).toBe('Rotterdam, Netherlands');

    secondField.input.value = 'Rotrdam, Netherlands';
    secondField.input.dispatchEvent(new window.Event('input'));

    expect(store.getState().origin.placeId).toBe('');
    expect(firstField.input.value).toBe('Rotrdam, Netherlands');

    unsubscribe();
    firstController.destroy();
    secondController.destroy();
  });

  it('ignores a result from an older request', async () => {
    vi.useFakeTimers();

    const store = createRateModuleStore();
    const field = createField();
    const resolvers = new Map();
    const placesService = {
      createSessionToken: vi.fn().mockResolvedValue({ id: 'session' }),
      getSuggestions: vi.fn(
        (query) =>
          new Promise((resolve) => {
            resolvers.set(query, resolve);
          })
      ),
    };
    const controller = createLocationField('destination', field, store, placesService, 'one');

    field.input.value = 'Ro';
    field.input.dispatchEvent(new window.Event('input'));
    await vi.advanceTimersByTimeAsync(300);

    field.input.value = 'Sha';
    field.input.dispatchEvent(new window.Event('input'));
    await vi.advanceTimersByTimeAsync(300);

    resolvers.get('Sha')([createSuggestion('Shanghai, China', 'shanghai-id')]);
    await Promise.resolve();
    await Promise.resolve();

    expect(field.list.textContent).toContain('Shanghai, China');

    resolvers.get('Ro')([createSuggestion('Rotterdam, Netherlands', 'rotterdam-id')]);
    await Promise.resolve();
    await Promise.resolve();

    expect(field.list.textContent).toContain('Shanghai, China');
    expect(field.list.textContent).not.toContain('Rotterdam, Netherlands');

    controller.destroy();
  });

  it('shows an accessible empty state when no city matches', async () => {
    vi.useFakeTimers();

    const store = createRateModuleStore();
    const field = createField();
    const placesService = {
      createSessionToken: vi.fn().mockResolvedValue({ id: 'session' }),
      getSuggestions: vi.fn().mockResolvedValue([]),
    };
    const controller = createLocationField('origin', field, store, placesService, 'one');

    field.input.value = 'Unknown place';
    field.input.dispatchEvent(new window.Event('input'));
    await vi.advanceTimersByTimeAsync(300);

    expect(field.list.hidden).toBe(false);
    expect(field.list.querySelector('[role="status"]').textContent).toBe(
      'No matching cities found.'
    );

    controller.destroy();
  });
});

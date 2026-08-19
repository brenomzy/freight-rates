import { describe, expect, it, vi } from 'vitest';

import { createRateModuleStore } from '../src/rate-module/store.js';

describe('rate module store', () => {
  it('starts with Sea as the only transport mode', () => {
    const store = createRateModuleStore();

    expect(store.getState().transportModes).toEqual(['sea']);
  });

  it('notifies subscribers when state changes', () => {
    const store = createRateModuleStore();
    const listener = vi.fn();
    const unsubscribe = store.subscribe(listener);

    store.patchState({ transportModes: ['air', 'rail'] });

    expect(listener).toHaveBeenCalledOnce();
    expect(listener).toHaveBeenCalledWith(store.getState());
    expect(store.getState().transportModes).toEqual(['air', 'rail']);

    unsubscribe();
    store.patchState({ transportModes: ['sea'] });

    expect(listener).toHaveBeenCalledOnce();
  });

  it('returns immutable state snapshots', () => {
    const store = createRateModuleStore();
    const state = store.getState();

    expect(Object.isFrozen(state)).toBe(true);
    expect(Object.isFrozen(state.origin)).toBe(true);
    expect(Object.isFrozen(state.transportModes)).toBe(true);
  });
});

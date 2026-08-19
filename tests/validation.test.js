import { describe, expect, it } from 'vitest';

import { createInitialRateModuleState } from '../src/rate-module/state.js';
import { getValidationErrors, hasValidationErrors } from '../src/rate-module/validation.js';

function createValidState() {
  return {
    origin: { label: 'Rotterdam, Netherlands', placeId: 'origin-place' },
    destination: { label: 'Shanghai, China', placeId: 'destination-place' },
    cargo: { label: "40' high cube container", value: 'HC_40' },
    readyDate: '2026-11-15',
    transportModes: ['sea'],
  };
}

describe('rate module validation', () => {
  it('marks every empty field except the default transport mode', () => {
    const errors = getValidationErrors(createInitialRateModuleState(), '2026-11-15');

    expect(errors).toEqual({
      origin: true,
      destination: true,
      cargo: true,
      readyDate: true,
      transport: false,
    });
  });

  it('accepts a complete valid state', () => {
    const errors = getValidationErrors(createValidState(), '2026-11-15');

    expect(hasValidationErrors(errors)).toBe(false);
  });

  it('does not accept free location text without a selected place', () => {
    const state = createValidState();
    state.origin = { label: 'Rotrdam, Netherlands', placeId: '' };

    expect(getValidationErrors(state, '2026-11-15').origin).toBe(true);
  });

  it('rejects past dates and an empty transport selection', () => {
    const state = createValidState();
    state.readyDate = '2026-11-14';
    state.transportModes = [];
    const errors = getValidationErrors(state, '2026-11-15');

    expect(errors.readyDate).toBe(true);
    expect(errors.transport).toBe(true);
  });
});

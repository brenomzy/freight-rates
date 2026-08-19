import { afterEach, describe, expect, it } from 'vitest';

import { getGoogleMapsApiKey } from '../src/config.js';

describe('runtime configuration', () => {
  afterEach(() => {
    Reflect.deleteProperty(window, 'FREIGHT_RATES_CONFIG');
  });

  it('reads and trims the Google Maps browser key', () => {
    Reflect.set(window, 'FREIGHT_RATES_CONFIG', {
      googleMapsApiKey: '  test-browser-key  ',
    });

    expect(getGoogleMapsApiKey()).toBe('test-browser-key');
  });

  it('throws a useful error when the key is missing', () => {
    expect(() => getGoogleMapsApiKey()).toThrow('Missing Google Maps API key');
  });
});

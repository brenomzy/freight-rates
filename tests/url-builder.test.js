import { describe, expect, it } from 'vitest';

import { buildRateUrl } from '../src/rate-module/url-builder.js';

const baseState = {
  origin: { label: 'Rotterdam, Netherlands', placeId: 'origin-place' },
  destination: { label: 'Shanghai, China', placeId: 'destination-place' },
  cargo: { label: "40' high cube container", value: 'HC_40' },
  readyDate: '2026-11-15',
  transportModes: ['sea'],
};

function getPath(state) {
  const url = buildRateUrl({
    baseHref: '/calculator',
    currentUrl: 'https://digital-sparks-freight-rates.webflow.io/',
    state,
  });

  return `${url.pathname}${url.search}`;
}

describe('rate URL builder', () => {
  it('builds the standard container URL from the brief', () => {
    expect(getPath(baseState)).toBe(
      '/calculator?origin=Rotterdam%2C+Netherlands&destination=Shanghai%2C+China&transportDate=2026-11-15&transportMode=sea&containerType=HC_40'
    );
  });

  it('keeps an empty containerType for Other FCL', () => {
    const state = {
      ...baseState,
      cargo: { label: 'Other FCL', value: 'FCL' },
    };

    expect(getPath(state)).toBe(
      '/calculator?origin=Rotterdam%2C+Netherlands&destination=Shanghai%2C+China&transportDate=2026-11-15&transportMode=sea&containerType='
    );
  });

  it('omits containerType for Other LCL', () => {
    const state = {
      ...baseState,
      cargo: { label: 'Other LCL', value: 'LCL' },
      transportModes: ['air', 'sea'],
    };

    expect(getPath(state)).toBe(
      '/calculator?origin=Rotterdam%2C+Netherlands&destination=Shanghai%2C+China&transportDate=2026-11-15&transportMode=sea%2Cair'
    );
  });

  it('uses a stable transport order', () => {
    const state = {
      ...baseState,
      transportModes: ['rail', 'sea', 'air'],
    };
    const url = buildRateUrl({
      baseHref: '/calculator',
      currentUrl: 'https://digital-sparks-freight-rates.webflow.io/',
      state,
    });

    expect(url.searchParams.get('transportMode')).toBe('sea,air,rail');
  });
});

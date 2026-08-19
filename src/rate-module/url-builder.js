import { TRANSPORT_MODES } from './state.js';

export function buildRateUrl({ baseHref, currentUrl, state }) {
  const url = new URL(baseHref, currentUrl);
  const params = new URLSearchParams();
  const transportModes = TRANSPORT_MODES.filter((mode) => state.transportModes.includes(mode));

  params.append('origin', state.origin.label);
  params.append('destination', state.destination.label);
  params.append('transportDate', state.readyDate);
  params.append('transportMode', transportModes.join(','));

  if (state.cargo.value !== 'LCL') {
    params.append('containerType', state.cargo.value === 'FCL' ? '' : state.cargo.value);
  }

  url.search = params.toString();
  url.hash = '';

  return url;
}

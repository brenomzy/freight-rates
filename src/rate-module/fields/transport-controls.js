import { TRANSPORT_MODES } from '../state.js';

export function createTransportControls(transport, store) {
  const inputs = {
    sea: transport.sea,
    air: transport.air,
    rail: transport.rail,
  };

  function handleChange() {
    store.patchState({
      transportModes: TRANSPORT_MODES.filter((mode) => inputs[mode].checked),
    });
  }

  TRANSPORT_MODES.forEach((mode) => {
    inputs[mode].addEventListener('change', handleChange);
  });

  return {
    render(transportModes) {
      TRANSPORT_MODES.forEach((mode) => {
        inputs[mode].checked = transportModes.includes(mode);
      });
    },
    destroy() {
      TRANSPORT_MODES.forEach((mode) => {
        inputs[mode].removeEventListener('change', handleChange);
      });
    },
  };
}

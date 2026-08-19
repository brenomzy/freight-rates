export const TRANSPORT_MODES = Object.freeze(['sea', 'air', 'rail']);

export function createEmptyLocation() {
  return {
    inputValue: '',
    label: '',
    placeId: '',
  };
}

export function createInitialRateModuleState() {
  return {
    origin: createEmptyLocation(),
    destination: createEmptyLocation(),
    cargo: null,
    readyDate: '',
    transportModes: ['sea'],
  };
}

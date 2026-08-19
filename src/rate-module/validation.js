import { getLocalDateValue, isDateBefore, isValidDateValue } from '../utils/date.js';
import { TRANSPORT_MODES } from './state.js';

function hasSelectedLocation(location) {
  return Boolean(location?.label && location?.placeId);
}

function hasSelectedCargo(cargo) {
  return Boolean(cargo?.label && cargo?.value);
}

export function getValidationErrors(state, minimumDate = getLocalDateValue()) {
  return {
    origin: !hasSelectedLocation(state.origin),
    destination: !hasSelectedLocation(state.destination),
    cargo: !hasSelectedCargo(state.cargo),
    readyDate: !isValidDateValue(state.readyDate) || isDateBefore(state.readyDate, minimumDate),
    transport: !state.transportModes.some((mode) => TRANSPORT_MODES.includes(mode)),
  };
}

export function hasValidationErrors(errors) {
  return Object.values(errors).some(Boolean);
}

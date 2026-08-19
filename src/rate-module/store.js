import { createInitialRateModuleState } from './state.js';

function freezeState(state) {
  return Object.freeze({
    ...state,
    origin: Object.freeze({ ...state.origin }),
    destination: Object.freeze({ ...state.destination }),
    cargo: state.cargo ? Object.freeze({ ...state.cargo }) : null,
    transportModes: Object.freeze([...state.transportModes]),
  });
}

export function createRateModuleStore(initialState = createInitialRateModuleState()) {
  let state = freezeState(initialState);
  const listeners = new Set();

  function getState() {
    return state;
  }

  function setState(update) {
    const nextState = typeof update === 'function' ? update(state) : update;

    if (nextState === state) return state;

    state = freezeState(nextState);
    listeners.forEach((listener) => listener(state));

    return state;
  }

  function patchState(update) {
    const patch = typeof update === 'function' ? update(state) : update;

    return setState({ ...state, ...patch });
  }

  function subscribe(listener) {
    listeners.add(listener);

    return () => {
      listeners.delete(listener);
    };
  }

  return {
    getState,
    patchState,
    setState,
    subscribe,
  };
}

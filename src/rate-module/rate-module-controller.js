import { getRateModuleElements } from './selectors.js';

const controllers = new WeakMap();

export function createRateModuleController(root, store) {
  const existingController = controllers.get(root);

  if (existingController) return existingController;

  const elements = getRateModuleElements(root);

  function render(state) {
    elements.transport.sea.checked = state.transportModes.includes('sea');
    elements.transport.air.checked = state.transportModes.includes('air');
    elements.transport.rail.checked = state.transportModes.includes('rail');
  }

  const unsubscribe = store.subscribe(render);
  render(store.getState());

  const controller = {
    elements,
    destroy() {
      unsubscribe();
      controllers.delete(root);
    },
  };

  controllers.set(root, controller);

  return controller;
}

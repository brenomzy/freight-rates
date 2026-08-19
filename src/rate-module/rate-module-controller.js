import { createCargoField } from './fields/cargo-field.js';
import { createTransportControls } from './fields/transport-controls.js';
import { getRateModuleElements } from './selectors.js';

const controllers = new WeakMap();
let moduleCount = 0;

export function createRateModuleController(root, store) {
  const existingController = controllers.get(root);

  if (existingController) return existingController;

  const elements = getRateModuleElements(root);
  moduleCount += 1;
  const moduleId = moduleCount;
  const cargoField = createCargoField(elements.fields.cargo, store, moduleId);
  const transportControls = createTransportControls(elements.transport, store);

  function render(state) {
    cargoField.render(state.cargo);
    transportControls.render(state.transportModes);
  }

  const unsubscribe = store.subscribe(render);
  render(store.getState());

  const controller = {
    elements,
    destroy() {
      cargoField.destroy();
      transportControls.destroy();
      unsubscribe();
      controllers.delete(root);
    },
  };

  controllers.set(root, controller);

  return controller;
}

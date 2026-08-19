import { createPlacesService } from '../services/places-service.js';
import { createRateModuleController } from './rate-module-controller.js';
import { getRateModuleRoots } from './selectors.js';
import { createRateModuleStore } from './store.js';

const initializations = new WeakMap();

export function initRateModules(scope = document, options = {}) {
  const existingInitialization = initializations.get(scope);

  if (existingInitialization) return existingInitialization;

  const store = createRateModuleStore();
  const placesService = options.placesService ?? createPlacesService();
  const controllers = getRateModuleRoots(scope).map((root) =>
    createRateModuleController(root, store, {
      navigate: options.navigate,
      placesService,
    })
  );
  const initialization = {
    controllers,
    store,
    destroy() {
      controllers.forEach((controller) => controller.destroy());
      initializations.delete(scope);
    },
  };

  initializations.set(scope, initialization);

  return initialization;
}

import { initRateModules } from './rate-module/init-rate-modules.js';

window.Webflow ||= [];
window.Webflow.push(() => {
  initRateModules();
});

import { buildRateUrl } from './url-builder.js';
import { getValidationErrors, hasValidationErrors } from './validation.js';

function addDescribedBy(element, id) {
  const describedBy = new Set((element.getAttribute('aria-describedby') ?? '').split(' '));

  describedBy.delete('');
  describedBy.add(id);
  element.setAttribute('aria-describedby', [...describedBy].join(' '));
}

function createFieldErrorController(field, name, moduleId) {
  const { error, input } = field;

  if (!error) throw new Error(`[rate-module] Missing ${name} error message.`);

  error.id ||= `rate-module-${moduleId}-${name}-error`;
  error.hidden = true;
  error.setAttribute('role', 'alert');
  addDescribedBy(input, error.id);

  return {
    clear() {
      error.hidden = true;
      input.classList.remove('is-error');
      input.removeAttribute('aria-invalid');
    },
    show() {
      error.hidden = false;
      input.classList.add('is-error');
      input.setAttribute('aria-invalid', 'true');
    },
  };
}

function createTransportErrorController(transport, moduleId) {
  const { error, group, sea, air, rail } = transport;
  const inputs = [sea, air, rail];

  if (!error) throw new Error('[rate-module] Missing transport error message.');

  error.id ||= `rate-module-${moduleId}-transport-error`;
  error.hidden = true;
  error.setAttribute('role', 'alert');
  group?.setAttribute('role', 'group');
  group?.setAttribute('aria-describedby', error.id);
  inputs.forEach((input) => addDescribedBy(input, error.id));

  return {
    clear() {
      error.hidden = true;
      group?.classList.remove('is-error');
      inputs.forEach((input) => input.removeAttribute('aria-invalid'));
    },
    show() {
      error.hidden = false;
      group?.classList.add('is-error');
      inputs.forEach((input) => input.setAttribute('aria-invalid', 'true'));
    },
  };
}

function navigateTo(href) {
  window.location.assign(href);
}

export function createFormController(elements, store, moduleId, navigate = navigateTo) {
  const fieldErrors = {
    origin: createFieldErrorController(elements.fields.origin, 'origin', moduleId),
    destination: createFieldErrorController(elements.fields.destination, 'destination', moduleId),
    cargo: createFieldErrorController(elements.fields.cargo, 'cargo', moduleId),
    readyDate: createFieldErrorController(elements.fields.readyDate, 'ready-date', moduleId),
    transport: createTransportErrorController(elements.transport, moduleId),
  };
  let previousState = store.getState();

  function setErrors(errors) {
    Object.entries(fieldErrors).forEach(([name, controller]) => {
      if (errors[name]) {
        controller.show();
      } else {
        controller.clear();
      }
    });
  }

  function handleSubmit(event) {
    event.preventDefault();

    const state = store.getState();
    const errors = getValidationErrors(state);

    setErrors(errors);

    if (hasValidationErrors(errors)) return;

    const baseHref = elements.submit.getAttribute('href');

    if (!baseHref) throw new Error('[rate-module] Calculate link is missing its href.');

    const url = buildRateUrl({
      baseHref,
      currentUrl: window.location.href,
      state,
    });

    navigate(url.href);
  }

  elements.submit.addEventListener('click', handleSubmit);
  elements.form.addEventListener('submit', handleSubmit);

  return {
    render(state) {
      const errors = getValidationErrors(state);

      if (state.origin.inputValue !== previousState.origin.inputValue || !errors.origin) {
        fieldErrors.origin.clear();
      }

      if (
        state.destination.inputValue !== previousState.destination.inputValue ||
        !errors.destination
      ) {
        fieldErrors.destination.clear();
      }

      if (!errors.cargo) fieldErrors.cargo.clear();
      if (!errors.readyDate) fieldErrors.readyDate.clear();
      if (!errors.transport) fieldErrors.transport.clear();

      previousState = state;
    },
    destroy() {
      elements.submit.removeEventListener('click', handleSubmit);
      elements.form.removeEventListener('submit', handleSubmit);
    },
  };
}

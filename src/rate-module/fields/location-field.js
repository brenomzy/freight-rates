import { createEmptyLocation } from '../state.js';
import { createAccessibleListbox } from '../ui/accessible-listbox.js';

const MINIMUM_QUERY_LENGTH = 2;
const SEARCH_DELAY = 300;

function createGoogleAttribution() {
  const attribution = document.createElement('div');
  const logo = document.createElement('img');

  attribution.className = 'rate_google-attribution';
  logo.src = 'https://maps.gstatic.com/mapfiles/api-3/images/powered-by-google-on-white3.png';
  logo.alt = 'Powered by Google';
  attribution.append(logo);

  return attribution;
}

function createListStatus() {
  const status = document.createElement('div');

  status.className = 'rate_dropdown-status';
  status.setAttribute('aria-live', 'polite');
  status.setAttribute('role', 'status');

  return status;
}

export function createLocationField(name, field, store, placesService, moduleId) {
  const { input, list, optionTemplate } = field;

  if (!list || !optionTemplate) {
    throw new Error(`[rate-module] Missing ${name} suggestion list or option template.`);
  }

  let debounceTimer;
  let requestId = 0;
  let sessionTokenPromise;
  const status = createListStatus();

  const listbox = createAccessibleListbox({
    input,
    list,
    optionTemplate,
    footer: createGoogleAttribution(),
    idPrefix: `rate-module-${moduleId}-${name}`,
    onSelect(option) {
      cancelPendingSearch();
      sessionTokenPromise = undefined;
      store.patchState({
        [name]: {
          inputValue: option.label,
          label: option.label,
          placeId: option.placeId,
        },
      });
    },
    status,
  });

  input.autocomplete = 'off';
  input.spellcheck = false;
  input.setAttribute('aria-autocomplete', 'list');
  listbox.setOptions([]);

  function cancelPendingSearch() {
    requestId += 1;
    window.clearTimeout(debounceTimer);
    input.removeAttribute('aria-busy');
  }

  async function getSessionToken() {
    sessionTokenPromise ??= placesService.createSessionToken();

    return sessionTokenPromise;
  }

  async function search(query, currentRequestId) {
    input.setAttribute('aria-busy', 'true');
    listbox.setStatus('Searching locations…');
    listbox.open();

    try {
      const sessionToken = await getSessionToken();
      const suggestions = await placesService.getSuggestions(query, sessionToken);

      if (currentRequestId !== requestId) return;

      if (suggestions.length) {
        listbox.setStatus('');
        listbox.setOptions(suggestions);
        listbox.open();
      } else {
        listbox.setOptions([]);
        listbox.setStatus('No matching cities found.');
        listbox.open();
      }
    } catch (error) {
      if (currentRequestId !== requestId) return;

      sessionTokenPromise = undefined;
      listbox.setOptions([]);
      listbox.setStatus('Location suggestions are temporarily unavailable.');
      listbox.open();
      console.error(`[rate-module] ${name} suggestions are unavailable.`, error);
    } finally {
      if (currentRequestId === requestId) input.removeAttribute('aria-busy');
    }
  }

  function handleInput() {
    const inputValue = input.value;
    const query = inputValue.trim();

    cancelPendingSearch();
    listbox.setStatus('');
    listbox.setOptions([]);
    listbox.close();
    store.patchState({
      [name]: {
        ...createEmptyLocation(),
        inputValue,
      },
    });

    if (query.length < MINIMUM_QUERY_LENGTH) {
      sessionTokenPromise = undefined;
      return;
    }

    const currentRequestId = requestId;
    debounceTimer = window.setTimeout(() => search(query, currentRequestId), SEARCH_DELAY);
  }

  input.addEventListener('input', handleInput);

  return {
    render(location) {
      const inputValue = location.inputValue ?? location.label;

      if (input.value !== inputValue) input.value = inputValue;

      listbox.setSelectedValue(location.placeId);
    },
    destroy() {
      cancelPendingSearch();
      input.removeEventListener('input', handleInput);
      listbox.destroy();
    },
  };
}

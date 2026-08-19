import { createAccessibleListbox } from '../ui/accessible-listbox.js';

function getCargoOptions(select) {
  return Array.from(select.options)
    .filter((option) => option.value && !option.disabled)
    .map((option) => ({
      label: option.textContent.trim(),
      value: option.value,
    }));
}

export function createCargoField(field, store, moduleId) {
  const { input, list, optionTemplate, options: optionSource } = field;

  if (!list || !optionTemplate) {
    throw new Error('[rate-module] Missing cargo dropdown list or option template.');
  }

  const options = getCargoOptions(optionSource);
  const listbox = createAccessibleListbox({
    input,
    list,
    optionTemplate,
    idPrefix: `rate-module-${moduleId}-cargo`,
    openOnSpace: true,
    resetInputScrollOnSelect: true,
    toggleOnClick: true,
    onSelect(option) {
      store.patchState({ cargo: option });
    },
  });

  input.readOnly = true;
  input.autocomplete = 'off';
  input.spellcheck = false;
  input.setAttribute('aria-autocomplete', 'none');
  optionSource.selectedIndex = -1;
  listbox.setOptions(options);

  return {
    render(cargo) {
      input.value = cargo?.label ?? '';
      optionSource.value = cargo?.value ?? '';
      listbox.setSelectedValue(cargo?.value ?? '');
    },
    destroy() {
      listbox.destroy();
    },
  };
}

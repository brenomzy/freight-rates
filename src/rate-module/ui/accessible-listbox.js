function createOptionElement(template, item, index, listboxId) {
  const option = template.cloneNode(true);
  const primaryText = option.querySelector('.form_input-text');
  const secondaryText = option.querySelector('.form_input-text-xs');

  option.removeAttribute('data-rate-option-template');
  option.id = `${listboxId}-option-${index}`;
  option.dataset.rateOptionValue = item.value;
  option.setAttribute('role', 'option');
  option.setAttribute('aria-selected', 'false');
  option.tabIndex = -1;

  if (primaryText) {
    primaryText.textContent = item.optionLabel ?? item.label;
  } else {
    option.textContent = item.label;
  }

  if (secondaryText) {
    secondaryText.textContent = item.description ?? '';
    secondaryText.hidden = !item.description;
  }

  return option;
}

export function createAccessibleListbox({
  input,
  list,
  optionTemplate,
  idPrefix,
  onSelect,
  openOnSpace = false,
  resetInputScrollOnSelect = false,
  toggleOnClick = false,
  footer = null,
  status = null,
}) {
  const listboxId = `${idPrefix}-listbox`;
  const field = input.closest('.cargo_field') ?? list.parentElement;
  let items = [];
  let optionElements = [];
  let activeIndex = -1;
  let isOpen = false;

  input.setAttribute('role', 'combobox');
  input.setAttribute('aria-controls', listboxId);
  input.setAttribute('aria-expanded', 'false');
  input.setAttribute('aria-haspopup', 'listbox');
  list.id = listboxId;
  list.setAttribute('role', 'listbox');
  list.hidden = true;
  if (status) status.hidden = true;

  function renderContents() {
    const content = optionElements.length
      ? [...optionElements, ...(footer ? [footer] : [])]
      : status && !status.hidden
        ? [status]
        : [];

    list.replaceChildren(...content);
  }

  function setActiveIndex(index) {
    if (!optionElements.length) return;

    activeIndex = (index + optionElements.length) % optionElements.length;

    optionElements.forEach((option, optionIndex) => {
      option.classList.toggle('is-active', optionIndex === activeIndex);
    });

    input.setAttribute('aria-activedescendant', optionElements[activeIndex].id);
    optionElements[activeIndex].scrollIntoView?.({ block: 'nearest' });
  }

  function open(animate = false) {
    if (!items.length && (!status || status.hidden)) return;

    if (animate && !isOpen) list.classList.add('is-pointer-opening');
    isOpen = true;
    list.hidden = false;
    list.classList.add('show');
    field?.classList.add('is-rate-list-open');
    input.setAttribute('aria-expanded', 'true');
  }

  function close() {
    isOpen = false;
    activeIndex = -1;
    list.hidden = true;
    list.classList.remove('show');
    list.classList.remove('is-pointer-opening');
    field?.classList.remove('is-rate-list-open');
    input.setAttribute('aria-expanded', 'false');
    input.removeAttribute('aria-activedescendant');
    optionElements.forEach((option) => option.classList.remove('is-active'));
  }

  function select(index) {
    const item = items[index];

    if (!item) return;

    onSelect(item);
    close();
    resetInputScroll();
  }

  function resetInputScroll() {
    if (!resetInputScrollOnSelect) return;

    input.setSelectionRange?.(0, 0);
    input.scrollLeft = 0;
  }

  function setOptions(nextItems) {
    items = nextItems;
    optionElements = items.map((item, index) =>
      createOptionElement(optionTemplate, item, index, listboxId)
    );
    renderContents();
    activeIndex = -1;

    if (!items.length) close();
  }

  function setSelectedValue(value) {
    optionElements.forEach((option) => {
      option.setAttribute('aria-selected', String(option.dataset.rateOptionValue === value));
    });
  }

  function setStatus(message) {
    if (!status) return;

    status.textContent = message;
    status.hidden = !message;
    renderContents();
  }

  function handleInputClick() {
    if (toggleOnClick && isOpen) {
      close();
    } else {
      open(true);
    }
  }

  function handleInputKeydown(event) {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      open();
      setActiveIndex(activeIndex < 0 ? 0 : activeIndex + 1);
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      open();
      setActiveIndex(activeIndex < 0 ? optionElements.length - 1 : activeIndex - 1);
      return;
    }

    if (isOpen && event.key === 'Home') {
      event.preventDefault();
      setActiveIndex(0);
      return;
    }

    if (isOpen && event.key === 'End') {
      event.preventDefault();
      setActiveIndex(optionElements.length - 1);
      return;
    }

    if (
      isOpen &&
      activeIndex >= 0 &&
      (event.key === 'Enter' || (openOnSpace && event.key === ' '))
    ) {
      event.preventDefault();
      select(activeIndex);
      return;
    }

    if (!isOpen && openOnSpace && event.key === ' ') {
      event.preventDefault();
      open();
      setActiveIndex(0);
      return;
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      close();
    }
  }

  function handleListClick(event) {
    const option = event.target.closest('[role="option"]');

    if (!option || !list.contains(option)) return;

    select(optionElements.indexOf(option));
    input.focus();
    resetInputScroll();
  }

  function handleListPointerMove(event) {
    const option = event.target.closest('[role="option"]');

    if (!option || !list.contains(option)) return;

    setActiveIndex(optionElements.indexOf(option));
  }

  function handleListAnimationEnd() {
    list.classList.remove('is-pointer-opening');
  }

  function handleOutsideInteraction(event) {
    if (!field?.contains(event.target)) close();
  }

  input.addEventListener('click', handleInputClick);
  input.addEventListener('keydown', handleInputKeydown);
  list.addEventListener('click', handleListClick);
  list.addEventListener('pointermove', handleListPointerMove);
  list.addEventListener('animationend', handleListAnimationEnd);
  document.addEventListener('pointerdown', handleOutsideInteraction);
  document.addEventListener('focusin', handleOutsideInteraction);

  return {
    close,
    open,
    setOptions,
    setSelectedValue,
    setStatus,
    destroy() {
      close();
      input.removeEventListener('click', handleInputClick);
      input.removeEventListener('keydown', handleInputKeydown);
      list.removeEventListener('click', handleListClick);
      list.removeEventListener('pointermove', handleListPointerMove);
      list.removeEventListener('animationend', handleListAnimationEnd);
      document.removeEventListener('pointerdown', handleOutsideInteraction);
      document.removeEventListener('focusin', handleOutsideInteraction);
    },
  };
}

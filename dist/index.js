"use strict";
(() => {
  // bin/live-reload.js
  new EventSource(`${"http://localhost:3000"}/esbuild`).addEventListener("change", () => location.reload());

  // src/rate-module/ui/accessible-listbox.js
  function createOptionElement(template, item, index, listboxId) {
    const option = template.cloneNode(true);
    const primaryText = option.querySelector(".form_input-text");
    const secondaryText = option.querySelector(".form_input-text-xs");
    option.removeAttribute("data-rate-option-template");
    option.id = `${listboxId}-option-${index}`;
    option.dataset.rateOptionValue = item.value;
    option.setAttribute("role", "option");
    option.setAttribute("aria-selected", "false");
    option.tabIndex = -1;
    if (primaryText) {
      primaryText.textContent = item.label;
    } else {
      option.textContent = item.label;
    }
    if (secondaryText) {
      secondaryText.textContent = item.description ?? "";
      secondaryText.hidden = !item.description;
    }
    return option;
  }
  function createAccessibleListbox({
    input,
    list,
    optionTemplate,
    idPrefix,
    onSelect,
    openOnSpace = false
  }) {
    const listboxId = `${idPrefix}-listbox`;
    const field = input.closest(".cargo_field") ?? list.parentElement;
    let items = [];
    let optionElements = [];
    let activeIndex = -1;
    let isOpen = false;
    input.setAttribute("role", "combobox");
    input.setAttribute("aria-controls", listboxId);
    input.setAttribute("aria-expanded", "false");
    input.setAttribute("aria-haspopup", "listbox");
    list.id = listboxId;
    list.setAttribute("role", "listbox");
    list.hidden = true;
    function setActiveIndex(index) {
      if (!optionElements.length) return;
      activeIndex = (index + optionElements.length) % optionElements.length;
      optionElements.forEach((option, optionIndex) => {
        option.classList.toggle("is-active", optionIndex === activeIndex);
      });
      input.setAttribute("aria-activedescendant", optionElements[activeIndex].id);
      optionElements[activeIndex].scrollIntoView?.({ block: "nearest" });
    }
    function open() {
      if (!items.length) return;
      isOpen = true;
      list.hidden = false;
      list.classList.add("show");
      input.setAttribute("aria-expanded", "true");
    }
    function close() {
      isOpen = false;
      activeIndex = -1;
      list.hidden = true;
      list.classList.remove("show");
      input.setAttribute("aria-expanded", "false");
      input.removeAttribute("aria-activedescendant");
      optionElements.forEach((option) => option.classList.remove("is-active"));
    }
    function select(index) {
      const item = items[index];
      if (!item) return;
      onSelect(item);
      close();
    }
    function setOptions(nextItems) {
      items = nextItems;
      optionElements = items.map(
        (item, index) => createOptionElement(optionTemplate, item, index, listboxId)
      );
      list.replaceChildren(...optionElements);
      activeIndex = -1;
      if (!items.length) close();
    }
    function setSelectedValue(value) {
      optionElements.forEach((option) => {
        option.setAttribute("aria-selected", String(option.dataset.rateOptionValue === value));
      });
    }
    function handleInputClick() {
      open();
    }
    function handleInputKeydown(event) {
      if (event.key === "ArrowDown") {
        event.preventDefault();
        open();
        setActiveIndex(activeIndex < 0 ? 0 : activeIndex + 1);
        return;
      }
      if (event.key === "ArrowUp") {
        event.preventDefault();
        open();
        setActiveIndex(activeIndex < 0 ? optionElements.length - 1 : activeIndex - 1);
        return;
      }
      if (isOpen && event.key === "Home") {
        event.preventDefault();
        setActiveIndex(0);
        return;
      }
      if (isOpen && event.key === "End") {
        event.preventDefault();
        setActiveIndex(optionElements.length - 1);
        return;
      }
      if (isOpen && activeIndex >= 0 && (event.key === "Enter" || openOnSpace && event.key === " ")) {
        event.preventDefault();
        select(activeIndex);
        return;
      }
      if (!isOpen && openOnSpace && event.key === " ") {
        event.preventDefault();
        open();
        setActiveIndex(0);
        return;
      }
      if (event.key === "Escape") {
        event.preventDefault();
        close();
      }
    }
    function handleListClick(event) {
      const option = event.target.closest('[role="option"]');
      if (!option || !list.contains(option)) return;
      select(optionElements.indexOf(option));
      input.focus();
    }
    function handleListPointerMove(event) {
      const option = event.target.closest('[role="option"]');
      if (!option || !list.contains(option)) return;
      setActiveIndex(optionElements.indexOf(option));
    }
    function handleOutsideInteraction(event) {
      if (!field?.contains(event.target)) close();
    }
    input.addEventListener("click", handleInputClick);
    input.addEventListener("keydown", handleInputKeydown);
    list.addEventListener("click", handleListClick);
    list.addEventListener("pointermove", handleListPointerMove);
    document.addEventListener("pointerdown", handleOutsideInteraction);
    document.addEventListener("focusin", handleOutsideInteraction);
    return {
      close,
      open,
      setOptions,
      setSelectedValue,
      destroy() {
        input.removeEventListener("click", handleInputClick);
        input.removeEventListener("keydown", handleInputKeydown);
        list.removeEventListener("click", handleListClick);
        list.removeEventListener("pointermove", handleListPointerMove);
        document.removeEventListener("pointerdown", handleOutsideInteraction);
        document.removeEventListener("focusin", handleOutsideInteraction);
      }
    };
  }

  // src/rate-module/fields/cargo-field.js
  function getCargoOptions(select) {
    return Array.from(select.options).filter((option) => option.value && !option.disabled).map((option) => ({
      label: option.textContent.trim(),
      value: option.value
    }));
  }
  function createCargoField(field, store, moduleId) {
    const { input, list, optionTemplate, options: optionSource } = field;
    if (!list || !optionTemplate) {
      throw new Error("[rate-module] Missing cargo dropdown list or option template.");
    }
    const options = getCargoOptions(optionSource);
    const listbox = createAccessibleListbox({
      input,
      list,
      optionTemplate,
      idPrefix: `rate-module-${moduleId}-cargo`,
      openOnSpace: true,
      onSelect(option) {
        store.patchState({ cargo: option });
      }
    });
    input.readOnly = true;
    input.autocomplete = "off";
    input.spellcheck = false;
    input.setAttribute("aria-autocomplete", "none");
    optionSource.selectedIndex = -1;
    listbox.setOptions(options);
    return {
      render(cargo) {
        input.value = cargo?.label ?? "";
        optionSource.value = cargo?.value ?? "";
        listbox.setSelectedValue(cargo?.value ?? "");
      },
      destroy() {
        listbox.destroy();
      }
    };
  }

  // src/rate-module/state.js
  var TRANSPORT_MODES = Object.freeze(["sea", "air", "rail"]);
  function createEmptyLocation() {
    return {
      label: "",
      placeId: ""
    };
  }
  function createInitialRateModuleState() {
    return {
      origin: createEmptyLocation(),
      destination: createEmptyLocation(),
      cargo: null,
      readyDate: "",
      transportModes: ["sea"]
    };
  }

  // src/rate-module/fields/transport-controls.js
  function createTransportControls(transport, store) {
    const inputs = {
      sea: transport.sea,
      air: transport.air,
      rail: transport.rail
    };
    function handleChange() {
      store.patchState({
        transportModes: TRANSPORT_MODES.filter((mode) => inputs[mode].checked)
      });
    }
    TRANSPORT_MODES.forEach((mode) => {
      inputs[mode].addEventListener("change", handleChange);
    });
    return {
      render(transportModes) {
        TRANSPORT_MODES.forEach((mode) => {
          inputs[mode].checked = transportModes.includes(mode);
        });
      },
      destroy() {
        TRANSPORT_MODES.forEach((mode) => {
          inputs[mode].removeEventListener("change", handleChange);
        });
      }
    };
  }

  // src/rate-module/selectors.js
  var RATE_MODULE_SELECTOR = "[data-rate-module], .rate-module_component";
  var SELECTORS = Object.freeze({
    form: "[data-rate-form], form",
    originInput: '[data-rate-input="origin"], input[name="cargo_origin"]',
    destinationInput: '[data-rate-input="destination"], input[name="cargo_destination"]',
    cargoInput: '[data-rate-input="cargo"], input[name="cargo_type"]',
    cargoOptions: '[data-rate-options="cargo"], select[name="cargo_type"]',
    readyDateInput: '[data-rate-input="ready-date"], input[name="cargo_date"]',
    seaInput: '[data-rate-mode="sea"], input[name="cargo_option_sea"]',
    airInput: '[data-rate-mode="air"], input[name="cargo_option_air"]',
    railInput: '[data-rate-mode="rail"], input[name="cargo_option_train"]',
    submit: "[data-rate-submit], [data-button-click][href]"
  });
  function queryRequired(root, selector, name) {
    const element = root.querySelector(selector);
    if (!element) {
      throw new Error(`[rate-module] Missing ${name}. Expected: ${selector}`);
    }
    return element;
  }
  function findFieldElement(root, input, dataSelector, fallbackSelector) {
    return root.querySelector(dataSelector) ?? input.closest(".cargo_field")?.querySelector(fallbackSelector);
  }
  function getFieldElements(root, input, name) {
    return {
      input,
      list: findFieldElement(root, input, `[data-rate-list="${name}"]`, ".form_dropdown-list"),
      optionTemplate: findFieldElement(
        root,
        input,
        `[data-rate-option-template="${name}"]`,
        ".form_dropdown-link"
      ),
      error: findFieldElement(root, input, `[data-rate-error="${name}"]`, ".cargo_field-error")
    };
  }
  function getRateModuleRoots(scope = document) {
    return Array.from(scope.querySelectorAll(RATE_MODULE_SELECTOR));
  }
  function getRateModuleElements(root) {
    const originInput = queryRequired(root, SELECTORS.originInput, "origin input");
    const destinationInput = queryRequired(root, SELECTORS.destinationInput, "destination input");
    const cargoInput = queryRequired(root, SELECTORS.cargoInput, "cargo input");
    const readyDateInput = queryRequired(root, SELECTORS.readyDateInput, "ready date input");
    return {
      root,
      form: queryRequired(root, SELECTORS.form, "form"),
      fields: {
        origin: getFieldElements(root, originInput, "origin"),
        destination: getFieldElements(root, destinationInput, "destination"),
        cargo: {
          ...getFieldElements(root, cargoInput, "cargo"),
          options: queryRequired(root, SELECTORS.cargoOptions, "cargo options")
        },
        readyDate: {
          input: readyDateInput,
          error: findFieldElement(
            root,
            readyDateInput,
            '[data-rate-error="ready-date"]',
            ".cargo_field-error"
          )
        }
      },
      transport: {
        sea: queryRequired(root, SELECTORS.seaInput, "sea checkbox"),
        air: queryRequired(root, SELECTORS.airInput, "air checkbox"),
        rail: queryRequired(root, SELECTORS.railInput, "train checkbox"),
        error: root.querySelector('[data-rate-error="transport"]')
      },
      submit: queryRequired(root, SELECTORS.submit, "calculate link")
    };
  }

  // src/rate-module/rate-module-controller.js
  var controllers = /* @__PURE__ */ new WeakMap();
  var moduleCount = 0;
  function createRateModuleController(root, store) {
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
      }
    };
    controllers.set(root, controller);
    return controller;
  }

  // src/rate-module/store.js
  function freezeState(state) {
    return Object.freeze({
      ...state,
      origin: Object.freeze({ ...state.origin }),
      destination: Object.freeze({ ...state.destination }),
      cargo: state.cargo ? Object.freeze({ ...state.cargo }) : null,
      transportModes: Object.freeze([...state.transportModes])
    });
  }
  function createRateModuleStore(initialState = createInitialRateModuleState()) {
    let state = freezeState(initialState);
    const listeners = /* @__PURE__ */ new Set();
    function getState() {
      return state;
    }
    function setState(update) {
      const nextState = typeof update === "function" ? update(state) : update;
      if (nextState === state) return state;
      state = freezeState(nextState);
      listeners.forEach((listener) => listener(state));
      return state;
    }
    function patchState(update) {
      const patch = typeof update === "function" ? update(state) : update;
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
      subscribe
    };
  }

  // src/rate-module/init-rate-modules.js
  var initializations = /* @__PURE__ */ new WeakMap();
  function initRateModules(scope = document) {
    const existingInitialization = initializations.get(scope);
    if (existingInitialization) return existingInitialization;
    const store = createRateModuleStore();
    const controllers2 = getRateModuleRoots(scope).map(
      (root) => createRateModuleController(root, store)
    );
    const initialization = {
      controllers: controllers2,
      store,
      destroy() {
        controllers2.forEach((controller) => controller.destroy());
        initializations.delete(scope);
      }
    };
    initializations.set(scope, initialization);
    return initialization;
  }

  // src/index.js
  window.Webflow ||= [];
  window.Webflow.push(() => {
    initRateModules();
  });
})();
//# sourceMappingURL=index.js.map

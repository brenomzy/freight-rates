import flatpickr from 'flatpickr';

import { dateValueToLocalDate, getLocalDateValue } from '../../utils/date.js';

function getLocalToday() {
  return dateValueToLocalDate(getLocalDateValue());
}

export function createReadyDateField(field, store, moduleId) {
  const { input } = field;
  const calendarId = `rate-module-${moduleId}-ready-date-calendar`;

  input.readOnly = true;
  input.autocomplete = 'off';
  input.setAttribute('aria-haspopup', 'dialog');
  input.setAttribute('aria-expanded', 'false');
  input.setAttribute('aria-controls', calendarId);

  const calendar = flatpickr(input, {
    allowInput: false,
    ariaDateFormat: 'F j, Y',
    clickOpens: true,
    dateFormat: 'd-m-Y',
    disableMobile: true,
    minDate: getLocalToday(),
    onChange(selectedDates) {
      const selectedDate = selectedDates[0];

      store.patchState({
        readyDate: selectedDate ? getLocalDateValue(selectedDate) : '',
      });
    },
    onClose() {
      input.setAttribute('aria-expanded', 'false');
    },
    onOpen(_selectedDates, _dateString, instance) {
      instance.set('minDate', getLocalToday());
      input.setAttribute('aria-expanded', 'true');
    },
    onReady(_selectedDates, _dateString, instance) {
      instance.calendarContainer.id = calendarId;
      instance.calendarContainer.setAttribute('role', 'dialog');
      instance.calendarContainer.setAttribute('aria-label', 'Choose ready date');
    },
  });

  function handleKeydown(event) {
    if (['Enter', ' ', 'ArrowDown'].includes(event.key) && !calendar.isOpen) {
      event.preventDefault();
      calendar.open();
    }
  }

  input.addEventListener('keydown', handleKeydown);

  return {
    render(readyDate) {
      const currentValue = calendar.selectedDates[0]
        ? getLocalDateValue(calendar.selectedDates[0])
        : '';

      if (currentValue !== readyDate) {
        calendar.setDate(dateValueToLocalDate(readyDate), false);
      }
    },
    destroy() {
      input.removeEventListener('keydown', handleKeydown);
      calendar.destroy();
    },
  };
}

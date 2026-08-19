import flatpickr from 'flatpickr';

import { dateValueToLocalDate, getLocalDateValue } from '../../utils/date.js';
import { createMobileCalendarModal } from '../ui/mobile-calendar-modal.js';

function getLocalToday() {
  return dateValueToLocalDate(getLocalDateValue());
}

export function createReadyDateField(field, store, moduleId) {
  const { input } = field;
  const calendarId = `rate-module-${moduleId}-ready-date-calendar`;
  let animateNextOpen = true;
  let mobileModal;
  let positionTimer;

  input.readOnly = true;
  input.autocomplete = 'off';
  input.setAttribute('aria-haspopup', 'dialog');
  input.setAttribute('aria-expanded', 'false');
  input.setAttribute('aria-controls', calendarId);

  const calendar = flatpickr(input, {
    allowInput: false,
    ariaDateFormat: 'F j, Y',
    clickOpens: false,
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
      window.clearTimeout(positionTimer);
      input.setAttribute('aria-expanded', 'false');
      mobileModal.close();
    },
    onOpen(_selectedDates, _dateString, instance) {
      instance.set('minDate', getLocalToday());
      input.setAttribute('aria-expanded', 'true');

      const openedAsModal = mobileModal.open({ animate: animateNextOpen });

      if (!openedAsModal) {
        positionTimer = window.setTimeout(() => instance._positionCalendar(), 0);
      }

      animateNextOpen = true;
    },
    onReady(_selectedDates, _dateString, instance) {
      instance.calendarContainer.id = calendarId;
      instance.calendarContainer.setAttribute('role', 'dialog');
      instance.calendarContainer.setAttribute('aria-label', 'Choose ready date');
      mobileModal = createMobileCalendarModal({ calendar: instance, input, calendarId });
    },
  });

  function handleInputClick() {
    animateNextOpen = true;
    mobileModal.prepareOpen();
    calendar.open();
  }

  function handleKeydown(event) {
    if (['Enter', ' ', 'ArrowDown'].includes(event.key) && !calendar.isOpen) {
      event.preventDefault();
      animateNextOpen = false;
      mobileModal.prepareOpen();
      calendar.open();
    }
  }

  input.addEventListener('click', handleInputClick);
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
      window.clearTimeout(positionTimer);
      input.removeEventListener('click', handleInputClick);
      input.removeEventListener('keydown', handleKeydown);
      mobileModal.destroy();
      calendar.destroy();
    },
  };
}

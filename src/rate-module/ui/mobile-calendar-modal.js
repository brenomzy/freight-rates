const MOBILE_CALENDAR_QUERY = '(max-width: 479px)';
const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';
const MODAL_EXIT_DURATION = 180;

function createBackdrop(calendarId) {
  const backdrop = document.createElement('div');

  backdrop.className = 'rate_calendar-backdrop';
  backdrop.dataset.rateCalendarBackdrop = calendarId;
  backdrop.hidden = true;
  backdrop.setAttribute('aria-hidden', 'true');
  document.body.append(backdrop);

  return backdrop;
}

function getFocusableElements(container) {
  return Array.from(
    container.querySelectorAll(
      'button:not([disabled]), select:not([disabled]), input:not([disabled]), [tabindex="0"]'
    )
  ).filter((element) => !element.hidden && element.getAttribute('aria-hidden') !== 'true');
}

export function createMobileCalendarModal({ calendar, input, calendarId }) {
  const { calendarContainer: container } = calendar;
  const mobileCalendar = window.matchMedia(MOBILE_CALENDAR_QUERY);
  const reducedMotion = window.matchMedia(REDUCED_MOTION_QUERY);
  const backdrop = createBackdrop(calendarId);
  let closeTimer;
  let openTimer;
  let isOpen = false;
  let animateNextClose = true;

  function finishClose() {
    container.classList.remove('is-rate-modal', 'is-rate-modal-open', 'is-rate-modal-closing');
    container.removeAttribute('aria-modal');
    backdrop.classList.remove('is-open');
    backdrop.hidden = true;
    document.body.classList.remove('rate-calendar-modal-open');
  }

  function close() {
    if (!isOpen) return;

    isOpen = false;
    window.clearTimeout(openTimer);
    window.clearTimeout(closeTimer);
    document.removeEventListener('keydown', handleKeydown);
    container.classList.remove('is-rate-modal-open');
    backdrop.classList.remove('is-open');

    if (animateNextClose && !reducedMotion.matches) {
      container.classList.add('is-rate-modal-closing');
      closeTimer = window.setTimeout(finishClose, MODAL_EXIT_DURATION);
    } else {
      finishClose();
    }

    animateNextClose = true;
    input.focus({ preventScroll: true });
  }

  function open({ animate = true } = {}) {
    if (!mobileCalendar.matches) return false;

    isOpen = true;
    animateNextClose = animate;
    window.clearTimeout(closeTimer);
    container.classList.remove('is-rate-modal-closing');
    container.classList.add('is-rate-modal');
    container.setAttribute('aria-modal', 'true');
    document.body.classList.add('rate-calendar-modal-open');
    backdrop.hidden = false;
    document.addEventListener('keydown', handleKeydown);

    const finishOpen = () => {
      container.classList.add('is-rate-modal-open');
      backdrop.classList.add('is-open');

      const selectedDay = container.querySelector(
        '.flatpickr-day.selected:not(.flatpickr-disabled), .flatpickr-day.today:not(.flatpickr-disabled), .flatpickr-day:not(.flatpickr-disabled):not(.prevMonthDay)'
      );

      selectedDay?.focus();
    };

    if (animate && !reducedMotion.matches) {
      openTimer = window.setTimeout(finishOpen, 16);
    } else {
      finishOpen();
    }

    return true;
  }

  function handleKeydown(event) {
    if (!isOpen) return;

    animateNextClose = false;

    if (event.key === 'Escape') {
      event.preventDefault();
      calendar.close();
      return;
    }

    if (event.key !== 'Tab') return;

    const focusableElements = getFocusableElements(container);
    const firstElement = focusableElements[0];
    const lastElement = focusableElements.at(-1);

    if (!firstElement || !lastElement) return;

    if (event.shiftKey && document.activeElement === firstElement) {
      event.preventDefault();
      lastElement.focus();
    } else if (!event.shiftKey && document.activeElement === lastElement) {
      event.preventDefault();
      firstElement.focus();
    }
  }

  function handleBackdropPointerDown() {
    animateNextClose = true;
    calendar.close();
  }

  function handleCalendarPointerDown() {
    animateNextClose = true;
  }

  function handleViewportChange() {
    if (calendar.isOpen) {
      animateNextClose = false;
      calendar.close();
    }
  }

  backdrop.addEventListener('pointerdown', handleBackdropPointerDown);
  container.addEventListener('pointerdown', handleCalendarPointerDown);
  mobileCalendar.addEventListener('change', handleViewportChange);

  return {
    close,
    open,
    destroy() {
      window.clearTimeout(openTimer);
      window.clearTimeout(closeTimer);
      document.removeEventListener('keydown', handleKeydown);
      backdrop.removeEventListener('pointerdown', handleBackdropPointerDown);
      container.removeEventListener('pointerdown', handleCalendarPointerDown);
      mobileCalendar.removeEventListener('change', handleViewportChange);
      finishClose();
      backdrop.remove();
    },
  };
}

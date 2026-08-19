import { afterEach, describe, expect, it, vi } from 'vitest';

import { createMobileCalendarModal } from '../src/rate-module/ui/mobile-calendar-modal.js';

afterEach(() => {
  vi.restoreAllMocks();
  document.body.replaceChildren();
});

describe('mobile calendar modal', () => {
  it('opens instantly for keyboard use and restores focus after Escape', () => {
    vi.spyOn(window, 'matchMedia').mockImplementation((query) => ({
      matches: query === '(max-width: 479px)',
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));

    const input = document.createElement('input');
    const calendarContainer = document.createElement('div');
    const day = document.createElement('span');
    const calendar = {
      calendarContainer,
      close: vi.fn(),
      isOpen: true,
    };

    day.className = 'flatpickr-day today';
    day.tabIndex = 0;
    calendarContainer.append(day);
    document.body.append(input, calendarContainer);

    const modal = createMobileCalendarModal({
      calendar,
      input,
      calendarId: 'ready-date-calendar',
    });

    expect(modal.open({ animate: false })).toBe(true);
    expect(calendarContainer.classList.contains('is-rate-modal-open')).toBe(true);
    expect(calendarContainer.getAttribute('aria-modal')).toBe('true');
    expect(document.activeElement).toBe(day);

    document.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Escape' }));

    expect(calendar.close).toHaveBeenCalledOnce();

    modal.close();

    expect(calendarContainer.classList.contains('is-rate-modal')).toBe(false);
    expect(document.querySelector('[data-rate-calendar-backdrop]').hidden).toBe(true);
    expect(document.activeElement).toBe(input);

    modal.destroy();
  });
});

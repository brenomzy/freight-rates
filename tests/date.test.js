import { describe, expect, it } from 'vitest';

import {
  dateValueToLocalDate,
  formatDateForDisplay,
  getLocalDateValue,
  isDateBefore,
  isValidDateValue,
} from '../src/utils/date.js';

describe('date utilities', () => {
  it('builds the date value from local date parts', () => {
    const localDate = new Date(2026, 10, 15, 23, 30);

    expect(getLocalDateValue(localDate)).toBe('2026-11-15');
  });

  it('formats a valid date for the input', () => {
    expect(formatDateForDisplay('2026-11-15')).toBe('15-11-2026');

    const localDate = dateValueToLocalDate('2026-11-15');

    expect(localDate).toEqual(new Date(2026, 10, 15));
  });

  it('rejects invalid calendar dates', () => {
    expect(isValidDateValue('2026-02-29')).toBe(false);
    expect(isValidDateValue('2028-02-29')).toBe(true);
    expect(formatDateForDisplay('not-a-date')).toBe('');
  });

  it('compares date-only values without converting to UTC', () => {
    expect(isDateBefore('2026-11-14', '2026-11-15')).toBe(true);
    expect(isDateBefore('2026-11-15', '2026-11-15')).toBe(false);
  });
});

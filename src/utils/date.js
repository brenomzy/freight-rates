const ISO_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

function padDatePart(value) {
  return String(value).padStart(2, '0');
}

function parseDateValue(value) {
  const match = ISO_DATE_PATTERN.exec(value);

  if (!match) return null;

  const [, yearValue, monthValue, dayValue] = match;
  const year = Number(yearValue);
  const month = Number(monthValue);
  const day = Number(dayValue);
  const date = new Date(year, month - 1, day);

  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return null;
  }

  return { day, month, year };
}

export function getLocalDateValue(date = new Date()) {
  return [date.getFullYear(), padDatePart(date.getMonth() + 1), padDatePart(date.getDate())].join(
    '-'
  );
}

export function isValidDateValue(value) {
  return parseDateValue(value) !== null;
}

export function isDateBefore(value, minimumDate) {
  if (!isValidDateValue(value) || !isValidDateValue(minimumDate)) return false;

  return value < minimumDate;
}

export function formatDateForDisplay(value) {
  const date = parseDateValue(value);

  if (!date) return '';

  return `${padDatePart(date.day)}-${padDatePart(date.month)}-${date.year}`;
}

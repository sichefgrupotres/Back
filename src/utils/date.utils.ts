export function parseLocalDate(date: string, isEnd = false): Date {
  const [year, month, day] = date.split('-').map(Number);

  if (isEnd) {
    return new Date(year, month - 1, day, 23, 59, 59, 999);
  }

  return new Date(year, month - 1, day, 0, 0, 0, 0);
}

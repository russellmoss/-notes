// src/lib/date-utils.ts
export function getStartOfDay(date: Date): Date {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  return start;
}

export function getEndOfDay(date: Date): Date {
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);
  return end;
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

export function formatDateForNotion(date: Date): string {
  return date.toISOString().split("T")[0];
}

export function getDateRange(date: Date): { start: string; end: string } {
  return {
    start: getStartOfDay(date).toISOString(),
    end: getEndOfDay(date).toISOString(),
  };
}

// Get notes that need review based on submission date
export function getReviewDates(submissionDate: Date) {
  return {
    nextDayReview: getStartOfDay(addDays(submissionDate, 1)),
    weekLaterReview: getStartOfDay(addDays(submissionDate, 7)),
  };
}

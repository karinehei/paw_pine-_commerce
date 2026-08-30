import { DISPATCH_MAX_DAYS, DISPATCH_MIN_DAYS } from "@/lib/constants";

function addWeekdays(start: Date, days: number): Date {
  const date = new Date(start);
  let remaining = days;
  while (remaining > 0) {
    date.setDate(date.getDate() + 1);
    const weekday = date.getDay();
    if (weekday !== 0 && weekday !== 6) {
      remaining -= 1;
    }
  }
  return date;
}

export function formatDispatchWindow(now = new Date(), locale = "en-GB"): string {
  const min = addWeekdays(now, DISPATCH_MIN_DAYS);
  const max = addWeekdays(now, DISPATCH_MAX_DAYS);
  const formatter = new Intl.DateTimeFormat(locale, { day: "numeric", month: "short" });
  return `${formatter.format(min)}–${formatter.format(max)}`;
}

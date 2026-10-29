import type { EventRecord } from "@/content/knowledge/schema";

export type EventStatus = "upcoming" | "ongoing" | "past" | "recurring-confirm-dates";

export type ResolvedEvent = {
  status: EventStatus;
  startDate?: string;
  endDate?: string;
  nextDate?: string;
};

function isoDay(year: number, month: number, day: number) {
  const mm = String(month).padStart(2, "0");
  const dd = String(day).padStart(2, "0");
  return `${year}-${mm}-${dd}`;
}

function ymd(date: Date) {
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Skopje",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return fmt.format(date);
}

export function resolveEvent(event: EventRecord, today: Date = new Date()): ResolvedEvent {
  const cal = event.calendar;
  if (cal.startDate && cal.endDate) {
    const now = ymd(today);
    if (now < cal.startDate) {
      return { status: "upcoming", startDate: cal.startDate, endDate: cal.endDate, nextDate: cal.startDate };
    }
    if (now > cal.endDate) {
      return { status: "past", startDate: cal.startDate, endDate: cal.endDate };
    }
    return { status: "ongoing", startDate: cal.startDate, endDate: cal.endDate };
  }

  if (cal.kind === "annual-fixed-date" && cal.month && cal.day) {
    const thisYear = isoDay(today.getFullYear(), cal.month, cal.day);
    const now = ymd(today);
    if (now === thisYear) {
      return { status: "ongoing", startDate: thisYear, endDate: thisYear, nextDate: thisYear };
    }
    if (now < thisYear) {
      return { status: "upcoming", nextDate: thisYear, startDate: thisYear, endDate: thisYear };
    }
    const nextYear = isoDay(today.getFullYear() + 1, cal.month, cal.day);
    return { status: "upcoming", nextDate: nextYear, startDate: nextYear, endDate: nextYear };
  }

  return { status: "recurring-confirm-dates" };
}

export type DayWindow = {
  weekday: number;
  open: string;
  close: string;
};

export type OpenState = {
  computed: boolean;
  open: boolean | null;
  weekday: number;
  clock: string;
  zone: string;
};

const ZONE = "Europe/Skopje";

function parts(at: Date) {
  const fmt = new Intl.DateTimeFormat("en-GB", {
    timeZone: ZONE,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });
  const bag = Object.fromEntries(fmt.formatToParts(at).map((part) => [part.type, part.value]));
  const map: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  return {
    weekday: map[bag.weekday ?? ""] ?? at.getDay(),
    clock: `${bag.hour ?? "00"}:${bag.minute ?? "00"}`,
  };
}

function toMinutes(clock: string) {
  const [h, m] = clock.split(":").map(Number);
  return h * 60 + m;
}

export function openState(windows: DayWindow[] | undefined, at: Date = new Date()): OpenState {
  const now = parts(at);
  if (!windows?.length) {
    return { computed: false, open: null, weekday: now.weekday, clock: now.clock, zone: ZONE };
  }
  const today = windows.filter((window) => window.weekday === now.weekday);
  if (!today.length) {
    return { computed: true, open: false, weekday: now.weekday, clock: now.clock, zone: ZONE };
  }
  const minutes = toMinutes(now.clock);
  const open = today.some((window) => minutes >= toMinutes(window.open) && minutes < toMinutes(window.close));
  return { computed: true, open, weekday: now.weekday, clock: now.clock, zone: ZONE };
}

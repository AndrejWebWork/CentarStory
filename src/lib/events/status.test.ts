import assert from "node:assert/strict";
import { programmes } from "@/content/knowledge/programmes";
import { resolveEvent } from "@/lib/events/status";

function run() {
  const ilinden = programmes.find((event) => event.slug === "ilinden");
  assert.ok(ilinden);
  const after = resolveEvent(ilinden, new Date("2026-10-29T12:00:00+02:00"));
  assert.equal(after.status, "upcoming");
  assert.equal(after.nextDate, "2027-08-02");
  assert.notEqual(after.nextDate, "2026-08-02");

  const onDay = resolveEvent(ilinden, new Date("2026-08-02T12:00:00+02:00"));
  assert.equal(onDay.status, "ongoing");

  const before = resolveEvent(ilinden, new Date("2026-07-01T12:00:00+02:00"));
  assert.equal(before.status, "upcoming");
  assert.equal(before.nextDate, "2026-08-02");

  const opera = programmes.find((event) => event.slug === "may-opera-evenings");
  assert.ok(opera);
  const operaNow = resolveEvent(opera, new Date("2026-10-29T12:00:00+02:00"));
  assert.equal(operaNow.status, "recurring-confirm-dates");

  const summer = programmes.find((event) => event.slug === "skopje-summer");
  assert.ok(summer);
  assert.equal(resolveEvent(summer, new Date("2026-10-29T12:00:00+02:00")).status, "recurring-confirm-dates");

  const expired = resolveEvent(
    {
      ...opera,
      calendar: { kind: "annual-season", startDate: "2026-05-01", endDate: "2026-05-31" },
    },
    new Date("2026-10-29T12:00:00+02:00"),
  );
  assert.equal(expired.status, "past");
  console.log("events ok");
}

run();

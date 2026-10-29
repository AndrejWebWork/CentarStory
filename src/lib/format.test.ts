import assert from "node:assert/strict";
import { formatCount, formatIsoDay, formatMkd } from "@/lib/format";

function run() {
  const day = formatIsoDay("2027-08-02", "en");
  assert.ok(day.includes("2027"));
  assert.ok(day.includes("Aug") || day.includes("August") || day.includes("8"));
  assert.equal(formatMkd(100, "en"), "100 MKD");
  assert.equal(formatCount(9, "en"), "9");
  console.log("format ok");
}

run();

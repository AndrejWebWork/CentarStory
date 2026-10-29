import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { locales } from "@/i18n/locales";

function flatten(value: unknown, prefix = ""): string[] {
  if (!value || typeof value !== "object" || Array.isArray(value)) return [prefix];
  return Object.entries(value as Record<string, unknown>).flatMap(([key, child]) =>
    flatten(child, prefix ? `${prefix}.${key}` : key),
  );
}

function run() {
  const maps = Object.fromEntries(
    locales.map((locale) => {
      const json = JSON.parse(readFileSync(`messages/${locale}.json`, "utf8"));
      return [locale, new Set(flatten(json))];
    }),
  );
  const en = maps.en;
  assert.ok(en.has("common.scriptStrategy"));
  assert.ok(en.has("nav.explore"));
  for (const locale of locales) {
    const keys = maps[locale];
    for (const key of en) {
      assert.ok(keys.has(key), `${locale} missing ${key}`);
    }
    for (const key of keys) {
      assert.ok(en.has(key), `${locale} extra ${key}`);
    }
  }
  console.log("messages ok", en.size, "keys ×", locales.length, "locales");
}

run();

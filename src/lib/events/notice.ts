export function noticeLabelKey(url: string) {
  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    if (host.endsWith(".gov.mk")) return "officialSource" as const;
  } catch {
    return "printedSource" as const;
  }
  return "printedSource" as const;
}

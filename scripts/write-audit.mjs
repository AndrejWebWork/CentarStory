import { writeFileSync } from "node:fs";
import { qualityMarkdown } from "../src/lib/content/quality.ts";

writeFileSync("docs/content-audit.md", qualityMarkdown());
writeFileSync("docs/content-quality-report.md", qualityMarkdown());
console.log("wrote docs/content-audit.md");

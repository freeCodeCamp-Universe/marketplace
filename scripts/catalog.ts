/**
 * Regenerate the catalog block in README.md from disk state.
 *
 * Usage:
 *   pnpm run catalog          # rewrite README.md
 *   pnpm run catalog --check  # exit 1 if README would change
 */

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { applyCatalogToReadme, buildCatalog, renderCatalog } from "./lib/catalog.js";

const ROOT = resolve(import.meta.dirname ?? dirname(fileURLToPath(import.meta.url)), "..");
const README = join(ROOT, "README.md");

function main(): void {
  const checkOnly = process.argv.includes("--check");

  const model = buildCatalog(ROOT);
  const rendered = renderCatalog(model);

  const current = readFileSync(README, "utf-8");
  const updated = applyCatalogToReadme(current, rendered);

  if (current === updated) {
    console.log("Catalog up to date.");
    return;
  }

  if (checkOnly) {
    console.error("Catalog drift detected: README.md does not match disk state.");
    console.error("Run `pnpm run catalog` to regenerate.");
    process.exit(1);
  }

  writeFileSync(README, updated);
  console.log(`Catalog updated in ${README}`);
}

main();

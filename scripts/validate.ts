import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { validate } from "./lib/validate.js";

const ROOT = resolve(import.meta.dirname ?? dirname(fileURLToPath(import.meta.url)), "..");

const { stdout, exitCode } = validate(ROOT);
console.log(stdout);
if (exitCode !== 0) {
  process.exit(exitCode);
}

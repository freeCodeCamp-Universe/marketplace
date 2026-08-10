import * as p from "@clack/prompts";
import { existsSync } from "node:fs";
import { join, resolve } from "node:path";
import {
  parseArgs,
  scaffold,
  ScaffoldError,
  type ScaffoldType,
  type ScaffoldOptions,
} from "./lib/scaffold.js";
import { validatePortableName, validateScaffoldDescription } from "./lib/metadata.js";

const ROOT = resolve(import.meta.dirname, "..");

function validateName(value: string | undefined): string | undefined {
  if (!value || value.trim().length === 0) {
    return "Name is required.";
  }
  const errors = validatePortableName(value);
  if (errors.length > 0) {
    return errors.join(". ") + ".";
  }
  return undefined;
}

function validateDescription(value: string | undefined): string | undefined {
  return validateScaffoldDescription(value);
}

async function runInteractive(partial: Partial<ScaffoldOptions>): Promise<ScaffoldOptions> {
  p.intro("Scaffold a new plugin, skill, or agent");

  const type =
    partial.type ??
    (await (async () => {
      const result = await p.select({
        message: "What do you want to create?",
        options: [
          { value: "plugin" as const, label: "Plugin" },
          { value: "skill" as const, label: "Standalone Skill" },
          { value: "agent" as const, label: "Shared Agent" },
        ],
      });
      if (p.isCancel(result)) {
        p.cancel("Cancelled.");
        process.exit(1);
      }
      return result;
    })());

  const name =
    partial.name ??
    (await (async () => {
      const result = await p.text({
        message: "Name?",
        placeholder: "my-plugin",
        validate: validateName,
      });
      if (p.isCancel(result)) {
        p.cancel("Cancelled.");
        process.exit(1);
      }
      return result;
    })());

  // Early existence check for better interactive UX
  const targetPaths: Record<ScaffoldType, string> = {
    plugin: join(ROOT, "plugins", name),
    skill: join(ROOT, "skills", name),
    agent: join(ROOT, "agents", `${name}.md`),
  };
  if (existsSync(targetPaths[type])) {
    p.log.error(`"${name}" already exists at ${targetPaths[type]}`);
    process.exit(1);
  }

  const description =
    partial.description ??
    (await (async () => {
      const result = await p.text({
        message: "Description?",
        placeholder: "A brief description",
        validate: validateDescription,
      });
      if (p.isCancel(result)) {
        p.cancel("Cancelled.");
        process.exit(1);
      }
      return result;
    })());

  return { name, description, type };
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));

  // Fail fast on invalid args before entering interactive mode
  if (args.name !== undefined) {
    const nameErr = validateName(args.name);
    if (nameErr) {
      console.error(`Invalid name: ${nameErr}`);
      process.exit(1);
    }
  }

  if (args.description !== undefined) {
    const descErr = validateDescription(args.description);
    if (descErr) {
      console.error(`Invalid description: ${descErr}`);
      process.exit(1);
    }
  }

  const isNonInteractive =
    args.name !== undefined && args.description !== undefined && args.type !== undefined;

  const opts: ScaffoldOptions = isNonInteractive
    ? (args as ScaffoldOptions)
    : await runInteractive(args);

  const msg = scaffold(opts, ROOT);
  if (isNonInteractive) {
    console.log(msg);
  } else {
    p.outro(msg);
  }
}

main().catch((err) => {
  if (err instanceof ScaffoldError) {
    console.error(err.message);
    process.exit(1);
  }
  console.error(err);
  process.exit(1);
});

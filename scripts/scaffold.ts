import * as p from "@clack/prompts";
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  renameSync,
  writeFileSync,
} from "node:fs";
import { join, resolve } from "node:path";
import { ADAPTERS, ADAPTER_IDS, type AdapterId, isAdapterId } from "./lib/adapters.js";
import { validatePortableName, validateScaffoldDescription } from "./lib/metadata.js";

const ROOT = resolve(import.meta.dirname, "..");
const TEMPLATES_DIR = join(ROOT, "templates");
const PLUGINS_DIR = join(ROOT, "plugins");
const CLAUDE_NATIVE_DIR = join(ROOT, "claude-native");
const SKILLS_DIR = join(ROOT, "skills");
const AGENTS_DIR = join(ROOT, "agents");

type ScaffoldType = "plugin" | "claude-native-plugin" | "skill" | "agent";

interface ScaffoldOptions {
  name: string;
  description: string;
  type: ScaffoldType;
  adapters: AdapterId[];
}

function parseArgs(argv: string[]): Partial<ScaffoldOptions> {
  const opts: Partial<ScaffoldOptions> = {};
  for (let i = 0; i < argv.length; i++) {
    const flag = argv[i];
    const next = argv[i + 1];
    if (flag === "--name" && next) {
      opts.name = argv[++i];
    } else if (flag === "--description" && next) {
      opts.description = argv[++i];
    } else if (flag === "--type" && next) {
      const val = argv[++i];
      if (
        val === "plugin" ||
        val === "claude-native-plugin" ||
        val === "skill" ||
        val === "agent"
      ) {
        opts.type = val;
      }
    } else if (flag === "--adapters" && next) {
      const ids = argv[++i]
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      const valid: AdapterId[] = [];
      for (const id of ids) {
        if (!isAdapterId(id)) {
          console.error(`Unknown adapter '${id}'. Allowed: ${ADAPTER_IDS.join(", ")}`);
          process.exit(1);
        }
        valid.push(id);
      }
      opts.adapters = valid;
    }
  }
  return opts;
}

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

function checkNameExists(name: string, type: ScaffoldType): string | undefined {
  const targetPath = getTargetPath(name, type);
  if (existsSync(targetPath)) {
    return `${getTypeLabel(type)} "${name}" already exists at ${targetPath}`;
  }
  return undefined;
}

function getTargetPath(name: string, type: ScaffoldType): string {
  if (type === "plugin") return join(PLUGINS_DIR, name);
  if (type === "claude-native-plugin") return join(CLAUDE_NATIVE_DIR, name);
  if (type === "skill") return join(SKILLS_DIR, name);
  return join(AGENTS_DIR, `${name}.md`);
}

function getTypeLabel(type: ScaffoldType): string {
  if (type === "plugin") return "Plugin";
  if (type === "claude-native-plugin") return "Claude-native plugin";
  if (type === "skill") return "Skill";
  return "Agent";
}

function copyDirSync(src: string, dest: string): void {
  mkdirSync(dest, { recursive: true });
  const entries = readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = join(src, entry.name);
    const destPath = join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirSync(srcPath, destPath);
    } else {
      copyFileSync(srcPath, destPath);
    }
  }
}

function formatBlock(value: string, indent = "  "): string {
  return value
    .split(/\r?\n/)
    .map((line) => `${indent}${line}`)
    .join("\n");
}

function replaceFrontmatter(content: string, name: string, description: string): string {
  return content
    .replace(/^name: [a-z0-9-]+$/m, `name: ${name}`)
    .replace(/^description: >[\s\S]*?(?=^---)/m, `description: >\n${formatBlock(description)}\n`);
}

function writeJson(filePath: string, data: unknown): void {
  writeFileSync(filePath, JSON.stringify(data, null, 2) + "\n");
}

function readJson<T = Record<string, unknown>>(filePath: string): T {
  return JSON.parse(readFileSync(filePath, "utf-8")) as T;
}

function scaffoldPlugin(name: string, description: string, adapters: AdapterId[]): void {
  const templateDir = join(TEMPLATES_DIR, "plugin");
  const targetDir = join(PLUGINS_DIR, name);

  copyDirSync(templateDir, targetDir);

  // Portable manifest
  const manifestPath = join(targetDir, "plugin.json");
  const manifest = readJson(manifestPath);
  manifest.name = name;
  manifest.description = description;
  manifest.version = "1.0.0";
  manifest.skills = [name];
  manifest.adapters = adapters;
  writeJson(manifestPath, manifest);

  // Seed skill
  const oldSkillDir = join(targetDir, "skills", "example");
  const newSkillDir = join(targetDir, "skills", name);
  renameSync(oldSkillDir, newSkillDir);
  const skillMdPath = join(newSkillDir, "SKILL.md");
  writeFileSync(
    skillMdPath,
    replaceFrontmatter(readFileSync(skillMdPath, "utf-8"), name, description),
  );

  // README
  const readmePath = join(targetDir, "README.md");
  let readme = readFileSync(readmePath, "utf-8");
  readme = readme
    .replace(/^# Plugin Name$/m, `# ${name}`)
    .replace(
      /^Short description of what this plugin does and the problem it solves\.$/m,
      description,
    )
    .replace(/plugins\/plugin-name/g, `plugins/${name}`);
  writeFileSync(readmePath, readme);

  // Adapters
  for (const id of adapters) {
    scaffoldAdapter(targetDir, name, description, id);
  }
}

function scaffoldAdapter(
  pluginDir: string,
  name: string,
  description: string,
  id: AdapterId,
): void {
  const adapterTemplate = join(TEMPLATES_DIR, "adapter", id);
  if (!existsSync(adapterTemplate)) {
    console.warn(
      `No template found for adapter '${id}' at ${adapterTemplate}. Skipping; create one before shipping.`,
    );
    return;
  }
  const targetDir = join(pluginDir, "adapters", id);
  copyDirSync(adapterTemplate, targetDir);

  const spec = ADAPTERS[id];
  const adapterManifest = join(pluginDir, spec.manifestPath);
  if (spec.manifestKind === "json" && existsSync(adapterManifest)) {
    const data = readJson(adapterManifest);
    data.name = name;
    data.description = description;
    data.version = "1.0.0";
    writeJson(adapterManifest, data);
  }
}

function scaffoldClaudeNativePlugin(name: string, description: string): void {
  const templateDir = join(TEMPLATES_DIR, "claude-native");
  const targetDir = join(CLAUDE_NATIVE_DIR, name);

  if (!existsSync(templateDir)) {
    console.error(
      `Claude-native template missing at ${templateDir}. Create it before scaffolding.`,
    );
    process.exit(1);
  }

  copyDirSync(templateDir, targetDir);

  const manifestPath = join(targetDir, ".claude-plugin", "plugin.json");
  const manifest = readJson(manifestPath);
  manifest.name = name;
  manifest.description = description;
  manifest.version = "1.0.0";
  writeJson(manifestPath, manifest);

  const readmePath = join(targetDir, "README.md");
  if (existsSync(readmePath)) {
    let readme = readFileSync(readmePath, "utf-8");
    readme = readme
      .replace(/^# Plugin Name$/m, `# ${name}`)
      .replace(
        /^Short description of what this plugin does and the problem it solves\.$/m,
        description,
      );
    writeFileSync(readmePath, readme);
  }
}

function scaffoldSkill(name: string, description: string): void {
  const templateDir = join(TEMPLATES_DIR, "skill");
  const targetDir = join(SKILLS_DIR, name);

  copyDirSync(templateDir, targetDir);

  const skillMdPath = join(targetDir, "SKILL.md");
  const skillMd = replaceFrontmatter(readFileSync(skillMdPath, "utf-8"), name, description);
  writeFileSync(skillMdPath, skillMd);
}

function scaffoldAgent(name: string, description: string): void {
  mkdirSync(AGENTS_DIR, { recursive: true });
  const templatePath = join(TEMPLATES_DIR, "agent.md");
  const targetPath = join(AGENTS_DIR, `${name}.md`);

  let agentMd = readFileSync(templatePath, "utf-8");
  agentMd = replaceFrontmatter(agentMd, name, description);
  agentMd = agentMd.replace(/^# Agent Name$/m, `# ${name}`);
  writeFileSync(targetPath, agentMd);
}

async function promptAdapters(): Promise<AdapterId[]> {
  const result = await p.multiselect({
    message: "Target tool adapters? (Space to select, Enter to confirm)",
    options: ADAPTER_IDS.map((id) => ({
      value: id,
      label: ADAPTERS[id].label,
    })),
    required: false,
  });
  if (p.isCancel(result)) {
    p.cancel("Cancelled.");
    process.exit(1);
  }
  return result as AdapterId[];
}

async function runInteractive(partial: Partial<ScaffoldOptions>): Promise<ScaffoldOptions> {
  p.intro("Scaffold a new plugin, skill, or agent");

  const type =
    partial.type ??
    (await (async () => {
      const result = await p.select({
        message: "What do you want to create?",
        options: [
          { value: "plugin" as const, label: "Plugin (portable; per-tool adapters)" },
          {
            value: "claude-native-plugin" as const,
            label: "Claude-native plugin (no portable counterpart)",
          },
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

  const existsErr = checkNameExists(name, type);
  if (existsErr) {
    p.log.error(existsErr);
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

  let adapters: AdapterId[] = [];
  if (type === "plugin") {
    adapters = partial.adapters ?? (await promptAdapters());
  }

  return { name, description, type, adapters };
}

function runNonInteractive(partial: Partial<ScaffoldOptions>): ScaffoldOptions {
  if (!partial.name || !partial.description || !partial.type) {
    console.error(
      "Non-interactive mode requires --name, --description, and --type flags. Optional: --adapters claude,codex.",
    );
    process.exit(1);
  }

  const nameErr = validateName(partial.name);
  if (nameErr) {
    console.error(`Invalid name: ${nameErr}`);
    process.exit(1);
  }

  const descErr = validateDescription(partial.description);
  if (descErr) {
    console.error(`Invalid description: ${descErr}`);
    process.exit(1);
  }

  const existsErr = checkNameExists(partial.name, partial.type);
  if (existsErr) {
    console.error(existsErr);
    process.exit(1);
  }

  return {
    name: partial.name,
    description: partial.description,
    type: partial.type,
    adapters: partial.adapters ?? [],
  };
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));

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

  const opts = isNonInteractive ? runNonInteractive(args) : await runInteractive(args);

  if (opts.type === "plugin") scaffoldPlugin(opts.name, opts.description, opts.adapters);
  else if (opts.type === "claude-native-plugin")
    scaffoldClaudeNativePlugin(opts.name, opts.description);
  else if (opts.type === "skill") scaffoldSkill(opts.name, opts.description);
  else if (opts.type === "agent") scaffoldAgent(opts.name, opts.description);

  const msg = `${getTypeLabel(opts.type)} created at ${relativeTargetPath(opts.name, opts.type)}. Run pnpm run validate to verify.`;
  if (isNonInteractive) {
    console.log(msg);
  } else {
    p.outro(msg);
  }
}

function relativeTargetPath(name: string, type: ScaffoldType): string {
  if (type === "plugin") return `plugins/${name}/`;
  if (type === "claude-native-plugin") return `claude-native/${name}/`;
  if (type === "skill") return `skills/${name}/`;
  return `agents/${name}.md`;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

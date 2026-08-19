import {
  mkdirSync,
  readdirSync,
  copyFileSync,
  readFileSync,
  writeFileSync,
  existsSync,
  renameSync,
} from "node:fs";
import { join } from "node:path";
import { validatePortableName, validateScaffoldDescription } from "./metadata.js";

export type ScaffoldType = "plugin" | "skill" | "agent";

export interface ScaffoldOptions {
  name: string;
  description: string;
  type: ScaffoldType;
}

export function parseArgs(argv: string[]): Partial<ScaffoldOptions> {
  const opts: Partial<ScaffoldOptions> = {};
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--name" && argv[i + 1]) {
      opts.name = argv[++i];
    } else if (argv[i] === "--description" && argv[i + 1]) {
      opts.description = argv[++i];
    } else if (argv[i] === "--type" && argv[i + 1]) {
      const val = argv[++i];
      if (val === "plugin" || val === "skill" || val === "agent") {
        opts.type = val;
      }
    }
  }
  return opts;
}

export class ScaffoldError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ScaffoldError";
  }
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

function scaffoldPlugin(name: string, description: string, rootDir: string): void {
  const templateDir = join(rootDir, "templates", "plugin");
  const targetDir = join(rootDir, "plugins", name);

  copyDirSync(templateDir, targetDir);

  const pluginJsonPath = join(targetDir, ".claude-plugin", "plugin.json");
  const pluginJson = JSON.parse(readFileSync(pluginJsonPath, "utf-8"));
  pluginJson.name = name;
  pluginJson.description = description;
  pluginJson.version = "1.0.0";
  writeFileSync(pluginJsonPath, JSON.stringify(pluginJson, null, 2) + "\n");

  const oldSkillDir = join(targetDir, "skills", "example");
  const newSkillDir = join(targetDir, "skills", name);
  renameSync(oldSkillDir, newSkillDir);

  const skillMdPath = join(newSkillDir, "SKILL.md");
  let skillMd = readFileSync(skillMdPath, "utf-8");
  skillMd = replaceFrontmatter(skillMd, name, description);
  writeFileSync(skillMdPath, skillMd);

  const readmePath = join(targetDir, "README.md");
  let readme = readFileSync(readmePath, "utf-8");
  readme = readme.replace(/^# Plugin Name$/m, `# ${name}`);
  readme = readme.replace(
    /^Short description of what this plugin does and the problem it solves\.$/m,
    description,
  );
  readme = readme.replace(/plugins\/plugin-name/g, `plugins/${name}`);
  writeFileSync(readmePath, readme);
}

function scaffoldSkill(name: string, description: string, rootDir: string): void {
  const templateDir = join(rootDir, "templates", "skill");
  const targetDir = join(rootDir, "skills", name);

  copyDirSync(templateDir, targetDir);

  const skillMdPath = join(targetDir, "SKILL.md");
  let skillMd = readFileSync(skillMdPath, "utf-8");
  skillMd = replaceFrontmatter(skillMd, name, description);
  writeFileSync(skillMdPath, skillMd);
}

function scaffoldAgent(name: string, description: string, rootDir: string): void {
  const agentsDir = join(rootDir, "agents");
  mkdirSync(agentsDir, { recursive: true });
  const templatePath = join(rootDir, "templates", "agent.md");
  const targetPath = join(agentsDir, `${name}.md`);

  let agentMd = readFileSync(templatePath, "utf-8");
  agentMd = replaceFrontmatter(agentMd, name, description);
  agentMd = agentMd.replace(/^# Agent Name$/m, `# ${name}`);
  writeFileSync(targetPath, agentMd);
}

function getTypeLabel(type: ScaffoldType): string {
  if (type === "plugin") return "Plugin";
  if (type === "skill") return "Skill";
  return "Agent";
}

function relativeTargetPath(name: string, type: ScaffoldType): string {
  if (type === "plugin") return `plugins/${name}/`;
  if (type === "skill") return `skills/${name}/`;
  return `agents/${name}.md`;
}

export function scaffold(opts: ScaffoldOptions, rootDir: string): string {
  if (!opts.name || opts.name.trim().length === 0) {
    throw new ScaffoldError("Invalid name: Name is required.");
  }
  const nameErrors = validatePortableName(opts.name);
  if (nameErrors.length > 0) {
    throw new ScaffoldError(`Invalid name: ${nameErrors.join(". ")}.`);
  }

  const descErr = validateScaffoldDescription(opts.description);
  if (descErr) {
    throw new ScaffoldError(`Invalid description: ${descErr}`);
  }

  const targetPaths: Record<ScaffoldType, string> = {
    plugin: join(rootDir, "plugins", opts.name),
    skill: join(rootDir, "skills", opts.name),
    agent: join(rootDir, "agents", `${opts.name}.md`),
  };
  const targetPath = targetPaths[opts.type];
  if (existsSync(targetPath)) {
    throw new ScaffoldError(
      `${getTypeLabel(opts.type)} "${opts.name}" already exists at ${targetPath}`,
    );
  }

  if (opts.type === "plugin") scaffoldPlugin(opts.name, opts.description, rootDir);
  if (opts.type === "skill") scaffoldSkill(opts.name, opts.description, rootDir);
  if (opts.type === "agent") scaffoldAgent(opts.name, opts.description, rootDir);

  return `${getTypeLabel(opts.type)} created at ${relativeTargetPath(opts.name, opts.type)}. Run pnpm run validate to verify.`;
}
